import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Person } from '../types/models';

export const subscribeToPeople = (
  uid: string,
  callback: (people: Person[]) => void,
  onError?: (error: Error) => void
) => {
  const peopleRef = collection(db, 'users', uid, 'people');
  const q = query(
    peopleRef,
    where('isArchived', '==', false)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const people: Person[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        people.push({
          personId: doc.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          cachedNetBalance: data.cachedNetBalance || 0,
          isArchived: data.isArchived || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort alphabetically client-side to avoid composite index requirement
      people.sort((a, b) => a.name.localeCompare(b.name));
      callback(people);
    },
    onError
  );
};

export const addPerson = async (
  uid: string,
  personData: { name: string; phone?: string; email?: string }
) => {
  const peopleRef = collection(db, 'users', uid, 'people');
  const docRef = await addDoc(peopleRef, {
    ...personData,
    cachedNetBalance: 0,
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updatePerson = async (
  uid: string,
  personId: string,
  personData: { name: string; phone?: string; email?: string }
) => {
  const personRef = doc(db, 'users', uid, 'people', personId);
  await updateDoc(personRef, {
    ...personData,
    updatedAt: serverTimestamp(),
  });
};

export const deletePerson = async (uid: string, personId: string) => {
  const personRef = doc(db, 'users', uid, 'people', personId);
  // Soft delete as planned
  await updateDoc(personRef, {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
};
