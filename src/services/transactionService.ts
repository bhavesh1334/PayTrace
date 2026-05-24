import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, TransactionDirection } from '../types/models';
import { AddTransactionSchema } from '../utils/schemas';

interface RawTransaction {
  amount: number;
  direction: 'lent' | 'borrowed';
}

const calculateNetBalance = (transactions: RawTransaction[]): number => {
  let balance = 0;
  for (const tx of transactions) {
    if (tx.direction === 'lent') {
      balance += tx.amount;
    } else {
      balance -= tx.amount;
    }
  }
  return Number(balance.toFixed(2));
};

export const subscribeToTransactions = (
  uid: string,
  personId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
) => {
  const txRef = collection(db, 'users', uid, 'people', personId, 'transactions');
  const q = query(txRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          txId: doc.id,
          amount: data.amount,
          direction: data.direction,
          date: data.date,
          note: data.note,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort client-side by date (descending), and fallback to createdAt (descending)
      transactions.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;

        const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      callback(transactions);
    },
    onError
  );
};

export const addTransaction = async (
  uid: string,
  personId: string,
  txData: { amount: number; direction: TransactionDirection; date: Date; note?: string }
) => {
  // Validate with Zod
  const validated = AddTransactionSchema.parse(txData);

  const txCollectionRef = collection(db, 'users', uid, 'people', personId, 'transactions');
  
  // 1. Fetch other transactions to calculate fresh net balance
  const txSnap = await getDocs(txCollectionRef);
  const rawTxs: RawTransaction[] = [];
  txSnap.forEach((doc) => {
    const data = doc.data();
    if (data && typeof data.amount === 'number' && data.direction) {
      rawTxs.push({ amount: data.amount, direction: data.direction as 'lent' | 'borrowed' });
    }
  });
  
  // Append new one
  rawTxs.push({ amount: validated.amount, direction: validated.direction });
  const newBalance = calculateNetBalance(rawTxs);

  // 2. Commit atomically via Batch write
  const batch = writeBatch(db);
  const newTxDocRef = doc(txCollectionRef);
  
  batch.set(newTxDocRef, {
    amount: validated.amount,
    direction: validated.direction,
    date: Timestamp.fromDate(validated.date),
    note: validated.note || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const personRef = doc(db, 'users', uid, 'people', personId);
  batch.update(personRef, {
    cachedNetBalance: newBalance,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return newTxDocRef.id;
};

export const updateTransaction = async (
  uid: string,
  personId: string,
  txId: string,
  txData: { amount: number; direction: TransactionDirection; date: Date; note?: string }
) => {
  // Validate with Zod
  const validated = AddTransactionSchema.parse(txData);

  const txCollectionRef = collection(db, 'users', uid, 'people', personId, 'transactions');
  
  // 1. Fetch all transactions to compute fresh net balance
  const txSnap = await getDocs(txCollectionRef);
  const rawTxs: RawTransaction[] = [];
  txSnap.forEach((doc) => {
    if (doc.id === txId) {
      // Use updated transaction info
      rawTxs.push({ amount: validated.amount, direction: validated.direction });
    } else {
      const data = doc.data();
      if (data && typeof data.amount === 'number' && data.direction) {
        rawTxs.push({ amount: data.amount, direction: data.direction as 'lent' | 'borrowed' });
      }
    }
  });
  
  const newBalance = calculateNetBalance(rawTxs);

  // 2. Commit atomically via Batch write
  const batch = writeBatch(db);
  const txRef = doc(db, 'users', uid, 'people', personId, 'transactions', txId);
  
  batch.update(txRef, {
    amount: validated.amount,
    direction: validated.direction,
    date: Timestamp.fromDate(validated.date),
    note: validated.note || '',
    updatedAt: serverTimestamp(),
  });

  const personRef = doc(db, 'users', uid, 'people', personId);
  batch.update(personRef, {
    cachedNetBalance: newBalance,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

export const deleteTransaction = async (uid: string, personId: string, txId: string) => {
  const txCollectionRef = collection(db, 'users', uid, 'people', personId, 'transactions');
  
  // 1. Fetch all other transactions to compute fresh net balance
  const txSnap = await getDocs(txCollectionRef);
  const rawTxs: RawTransaction[] = [];
  txSnap.forEach((doc) => {
    if (doc.id !== txId) {
      const data = doc.data();
      if (data && typeof data.amount === 'number' && data.direction) {
        rawTxs.push({ amount: data.amount, direction: data.direction as 'lent' | 'borrowed' });
      }
    }
  });
  
  const newBalance = calculateNetBalance(rawTxs);

  // 2. Commit atomically via Batch write
  const batch = writeBatch(db);
  const txRef = doc(db, 'users', uid, 'people', personId, 'transactions', txId);
  
  batch.delete(txRef);

  const personRef = doc(db, 'users', uid, 'people', personId);
  batch.update(personRef, {
    cachedNetBalance: newBalance,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

export const getTransactionPage = async (
  uid: string,
  personId: string,
  lastDocSnapshot: DocumentSnapshot | null,
  pageSize = 20
) => {
  const txRef = collection(db, 'users', uid, 'people', personId, 'transactions');
  let q = query(txRef, orderBy('date', 'desc'), limit(pageSize));

  if (lastDocSnapshot) {
    q = query(
      txRef,
      orderBy('date', 'desc'),
      startAfter(lastDocSnapshot),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  const transactions: Transaction[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    transactions.push({
      txId: doc.id,
      amount: data.amount,
      direction: data.direction,
      date: data.date,
      note: data.note,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { transactions, lastVisible };
};

export const settleAll = async (uid: string, personId: string, personName: string) => {
  const personRef = doc(db, 'users', uid, 'people', personId);
  const settlementsRef = collection(db, 'users', uid, 'settlements');

  await runTransaction(db, async (transaction) => {
    const personDoc = await transaction.get(personRef);
    if (!personDoc.exists()) {
      throw new Error('Person does not exist!');
    }

    const currentBalance = personDoc.data().cachedNetBalance || 0;
    if (currentBalance === 0) {
      return; // Already settled
    }

    // Create settlement document
    const newSettlementRef = doc(settlementsRef);
    transaction.set(newSettlementRef, {
      personId,
      personName,
      balanceAtSettlement: currentBalance,
      settledAt: serverTimestamp(),
      notes: `Settled net balance of ${currentBalance >= 0 ? '+' : ''}${currentBalance.toFixed(2)}`,
    });

    // Reset balance to 0 in person document
    transaction.update(personRef, {
      cachedNetBalance: 0,
      updatedAt: serverTimestamp(),
    });

    // Also, delete all underlying transactions for this person since we settled them
    // (Or we can leave them and let cloud function trigger keep balance at 0. Since we do soft/hard settlement,
    // let's just clear or keep the transactions. As per plan, we batch runTransaction: create settlement + update Person balance).
  });
};
