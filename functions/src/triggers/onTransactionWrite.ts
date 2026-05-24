import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { calculateNetBalance, RawTransaction } from '../utils/balanceCalculator';

export const onTransactionWrite = functions.firestore
  .document('users/{uid}/people/{personId}/transactions/{txId}')
  .onWrite(async (change, context) => {
    const { uid, personId } = context.params;
    const db = admin.firestore();

    const personRef = db.collection('users').doc(uid).collection('people').doc(personId);
    const txCollectionRef = personRef.collection('transactions');

    try {
      // Get all transactions for this person to calculate fresh net balance
      const txSnap = await txCollectionRef.get();
      const rawTxs: RawTransaction[] = [];

      txSnap.forEach((doc) => {
        const data = doc.data();
        if (data && typeof data.amount === 'number' && data.direction) {
          rawTxs.push({
            amount: data.amount,
            direction: data.direction as 'lent' | 'borrowed',
          });
        }
      });

      const newBalance = calculateNetBalance(rawTxs);

      // Save new balance to person document
      await personRef.update({
        cachedNetBalance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Updated cachedNetBalance for person ${personId} to: ${newBalance}`);
    } catch (error) {
      console.error(`Failed to update cachedNetBalance for person ${personId}:`, error);
    }
  });
