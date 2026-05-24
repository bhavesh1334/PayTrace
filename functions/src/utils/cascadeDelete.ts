import * as admin from 'firebase-admin';

export async function cascadeDeleteUser(uid: string) {
  const db = admin.firestore();
  const userRef = docWithMergeFix(db, 'users', uid);

  // 1. Get all people sub-collection documents
  const peopleRef = userRef.collection('people');
  const peopleSnap = await peopleRef.get();

  const batchLimit = 500;
  let batch = db.batch();
  let operationCount = 0;

  for (const personDoc of peopleSnap.docs) {
    // A. Clear transactions subcollection for this person
    const txRef = personDoc.ref.collection('transactions');
    const txSnap = await txRef.get();

    for (const txDoc of txSnap.docs) {
      batch.delete(txDoc.ref);
      operationCount++;

      if (operationCount >= batchLimit) {
        await batch.commit();
        batch = db.batch();
        operationCount = 0;
      }
    }

    // B. Delete the person document itself
    batch.delete(personDoc.ref);
    operationCount++;

    if (operationCount >= batchLimit) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  // 2. Clear settlements sub-collection
  const settlementsRef = userRef.collection('settlements');
  const settlementsSnap = await settlementsRef.get();

  for (const settlementDoc of settlementsSnap.docs) {
    batch.delete(settlementDoc.ref);
    operationCount++;

    if (operationCount >= batchLimit) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  // 3. Delete user document itself
  batch.delete(userRef);
  operationCount++;

  if (operationCount > 0) {
    await batch.commit();
  }
}

function docWithMergeFix(db: admin.firestore.Firestore, collectionPath: string, docId: string) {
  return db.collection(collectionPath).doc(docId);
}
