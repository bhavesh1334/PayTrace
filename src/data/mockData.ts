import { Timestamp } from 'firebase/firestore';
import { Person, Transaction } from '../types/models';

// Onboarding slides
export const onboardingSlides = [
  {
    id: '1',
    emoji: '💸',
    title: 'Track who owes you',
    subtitle: 'Keep a perfect record of every rupee lent or borrowed, instantly.',
  },
  {
    id: '2',
    emoji: '🤝',
    title: 'No more awkward conversations',
    subtitle: 'Let PayTrace remember the numbers so you stay focused on relationships.',
  },
  {
    id: '3',
    emoji: '✅',
    title: 'Settle with one tap',
    subtitle: 'Mark balances as settled and start fresh — no calculator needed.',
  },
];

// Mock people for UI preview / offline fallback
export const mockPeople: Person[] = [
  {
    personId: 'mock-1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@example.com',
    cachedNetBalance: 1500,
    isArchived: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    personId: 'mock-2',
    name: 'Priya Patel',
    phone: '9123456789',
    cachedNetBalance: -800,
    isArchived: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    personId: 'mock-3',
    name: 'Arjun Mehta',
    cachedNetBalance: 0,
    isArchived: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

// Mock transactions for UI preview
export const mockTransactions: Transaction[] = [
  {
    txId: 'tx-1',
    amount: 2000,
    direction: 'lent',
    date: Timestamp.fromDate(new Date('2024-05-10')),
    note: 'Birthday dinner',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    txId: 'tx-2',
    amount: 500,
    direction: 'borrowed',
    date: Timestamp.fromDate(new Date('2024-05-15')),
    note: 'Cab fare',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    txId: 'tx-3',
    amount: 1200,
    direction: 'lent',
    date: Timestamp.fromDate(new Date('2024-05-20')),
    note: 'Movie tickets',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];
