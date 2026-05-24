import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  provider: 'google' | 'email';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Person {
  personId: string;
  name: string;
  phone?: string;
  email?: string;
  cachedNetBalance: number; // Cloud Function maintains this
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TransactionDirection = 'lent' | 'borrowed';

export interface Transaction {
  txId: string;
  amount: number;
  direction: TransactionDirection;
  date: Timestamp;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Settlement {
  settlementId: string;
  personId: string;
  personName: string;
  balanceAtSettlement: number;
  settledAt: Timestamp;
  notes?: string;
}
