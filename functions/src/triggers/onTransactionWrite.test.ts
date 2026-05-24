/**
 * functions/src/triggers/onTransactionWrite.test.ts
 * Unit tests for the onTransactionWrite Firestore trigger.
 */

const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockTxGet = jest.fn();

jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    batch: jest.fn(),
    FieldValue: { serverTimestamp: jest.fn(() => 'SERVER_TS') },
  };

  const firestoreFn = Object.assign(jest.fn(() => firestoreMock), {
    FieldValue: { serverTimestamp: jest.fn(() => 'SERVER_TS') },
  });

  return {
    initializeApp: jest.fn(),
    app: jest.fn(() => ({})),
    auth: jest.fn(() => ({})),
    firestore: firestoreFn,
  };
});

jest.mock('firebase-functions', () => ({
  firestore: {
    document: jest.fn(() => ({
      onWrite: (handler: Function) => handler,
    })),
  },
}));

jest.mock('../utils/balanceCalculator', () => ({
  calculateNetBalance: jest.fn(),
}));

import { onTransactionWrite } from './onTransactionWrite';
import { calculateNetBalance } from '../utils/balanceCalculator';
import * as admin from 'firebase-admin';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function buildContext(uid = 'u1', personId = 'p1') {
  return { params: { uid, personId } };
}

function buildChange() {
  return { before: {}, after: {} };
}

function makeAdminChain(txDocs: any[]) {
  const db = admin.firestore() as any;

  // Reset chain mock: collection → doc → collection → get
  //                                   ↳ (personRef) → update
  let callIdx = 0;
  db.collection.mockImplementation(() => ({
    doc: jest.fn().mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) {
        // user doc ref → collection('people') → doc(personId)
        return {
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              update: mockUpdate,
              collection: jest.fn().mockReturnValue({ get: mockTxGet }),
            }),
          }),
        };
      }
      // tx collection access
      return { get: mockTxGet };
    }),
  }));

  mockTxGet.mockResolvedValue({
    docs: txDocs,
    forEach: (cb: (doc: any) => void) => txDocs.forEach(cb),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('onTransactionWrite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates net balance from all transactions and updates person document', async () => {
    const txDocs = [
      { data: () => ({ amount: 100, direction: 'lent' }) },
      { data: () => ({ amount: 40, direction: 'borrowed' }) },
    ];

    (calculateNetBalance as jest.Mock).mockReturnValue(60);
    makeAdminChain(txDocs);

    await (onTransactionWrite as any)(buildChange(), buildContext());

    expect(calculateNetBalance).toHaveBeenCalledWith([
      { amount: 100, direction: 'lent' },
      { amount: 40, direction: 'borrowed' },
    ]);
  });

  it('handles empty transaction set and writes balance of 0', async () => {
    (calculateNetBalance as jest.Mock).mockReturnValue(0);
    makeAdminChain([]);

    await (onTransactionWrite as any)(buildChange(), buildContext());

    expect(calculateNetBalance).toHaveBeenCalledWith([]);
  });

  it('skips invalid transaction documents (no amount or direction)', async () => {
    const txDocs = [
      { data: () => ({ note: 'invalid' }) }, // no amount/direction
      { data: () => ({ amount: 50, direction: 'lent' }) },
    ];

    (calculateNetBalance as jest.Mock).mockReturnValue(50);
    makeAdminChain(txDocs);

    await (onTransactionWrite as any)(buildChange(), buildContext());

    // Only the valid doc should be passed
    expect(calculateNetBalance).toHaveBeenCalledWith([
      { amount: 50, direction: 'lent' },
    ]);
  });

  it('does not throw when Firestore returns an error', async () => {
    mockTxGet.mockRejectedValue(new Error('Firestore unavailable'));

    const db = admin.firestore() as any;
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            update: mockUpdate,
            collection: jest.fn().mockReturnValue({ get: mockTxGet }),
          }),
        }),
      }),
    });

    // Should not throw — just logs the error
    await expect(
      (onTransactionWrite as any)(buildChange(), buildContext())
    ).resolves.toBeUndefined();
  });
});
