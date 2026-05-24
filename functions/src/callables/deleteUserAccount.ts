import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { cascadeDeleteUser } from '../utils/cascadeDelete';

export const deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Verify auth context
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;

  try {
    // 1. Cascade delete all documents associated with the user in Firestore
    await cascadeDeleteUser(uid);
    console.log(`Firestore documents wiped for user: ${uid}`);

    // 2. Delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    console.log(`Auth record deleted for user: ${uid}`);

    return { success: true, message: 'Account successfully deleted.' };
  } catch (error: any) {
    console.error(`Error deleting user account for ${uid}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred during account deletion.'
    );
  }
});
