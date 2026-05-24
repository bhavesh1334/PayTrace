import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProfile } from '../types/models';

export const createUserProfile = async (user: {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  provider: 'google' | 'email';
}) => {
  const userRef = doc(db, 'users', user.uid);
  const profile: Partial<UserProfile> = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    provider: user.provider,
    updatedAt: serverTimestamp() as any,
  };

  // setDoc with merge: true creates profile if doesn't exist, or merges update safely
  await setDoc(userRef, profile, { merge: true });

  // If it's a first-time create, we also set createdAt
  const snap = await getDoc(userRef);
  if (snap.exists() && !snap.data().createdAt) {
    await updateDoc(userRef, {
      createdAt: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
      provider: data.provider,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, profileData: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUserAccount = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is currently authenticated.');
  }

  const uid = currentUser.uid;
  const userRef = doc(db, 'users', uid);

  // 1. Get all people subcollection documents
  const peopleCollectionRef = collection(db, 'users', uid, 'people');
  const peopleSnap = await getDocs(peopleCollectionRef);

  const batchLimit = 500;
  let batch = writeBatch(db);
  let operationCount = 0;

  for (const personDoc of peopleSnap.docs) {
    // A. Fetch all transactions for this person
    const txCollectionRef = collection(db, 'users', uid, 'people', personDoc.id, 'transactions');
    const txSnap = await getDocs(txCollectionRef);

    for (const txDoc of txSnap.docs) {
      batch.delete(txDoc.ref);
      operationCount++;

      if (operationCount >= batchLimit) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    // B. Delete the person document itself
    batch.delete(personDoc.ref);
    operationCount++;

    if (operationCount >= batchLimit) {
      await batch.commit();
      batch = writeBatch(db);
      operationCount = 0;
    }
  }

  // 2. Clear settlements sub-collection
  const settlementsCollectionRef = collection(db, 'users', uid, 'settlements');
  const settlementsSnap = await getDocs(settlementsCollectionRef);

  for (const settlementDoc of settlementsSnap.docs) {
    batch.delete(settlementDoc.ref);
    operationCount++;

    if (operationCount >= batchLimit) {
      await batch.commit();
      batch = writeBatch(db);
      operationCount = 0;
    }
  }

  // 3. Delete user profile document itself
  batch.delete(userRef);
  operationCount++;

  if (operationCount > 0) {
    await batch.commit();
  }

  // 4. Delete the Auth user account
  try {
    await currentUser.delete();
  } catch (err: any) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error('For security, account deletion requires a recent login. Please sign out and sign back in to delete your account.');
    }
    throw err;
  }

  return { success: true, message: 'Account successfully deleted.' };
};
