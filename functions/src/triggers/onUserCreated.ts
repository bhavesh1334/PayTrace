import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(user.uid);

  const profile = {
    uid: user.uid,
    displayName: user.displayName || 'User',
    email: user.email || '',
    photoURL: user.photoURL || null,
    provider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await userRef.set(profile, { merge: true });
    console.log(`Successfully initialized profile for user: ${user.uid}`);
  } catch (error) {
    console.error(`Failed to initialize profile for user ${user.uid}:`, error);
  }
});
