/**
 * functions/src/utils/cascadeDelete.test.ts
 * Unit tests for the cascadeDeleteUser utility.
 * firebase-admin is fully mocked — no real Firestore calls.
 */

// ─── Mock firebase-admin ──────────────────────────────────────────────────────

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
const mockBatch = {
  delete: mockBatchDelete,
  commit: mockBatchCommit,
};

const mockTxGet = jest.fn();
const mockPeopleGet = jest.fn();
const mockSettlementsGet = jest.fn();

const mockCollection = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: mockCollection,
    batch: jest.fn(() => mockBatch),
  };
  return {
    firestore: Object.assign(() => firestoreMock, {
      FieldValue: { serverTimestamp: jest.fn() },
    }),
    initializeApp: jest.fn(),
    app: jest.fn(() => ({})),
  };
});

import { cascadeDeleteUser } from './cascadeDelete';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal Firestore DocumentSnapshot stub. */
function makeDocRef(id: string) {
  return {
    id,
    ref: { id, collection: jest.fn() },
    collection: jest.fn(),
    data: () => ({ id }),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('cascadeDeleteUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBatchCommit.mockResolvedValue(undefined);

    // Default: no nested documents
    mockTxGet.mockResolvedValue({ docs: [] });
    mockPeopleGet.mockResolvedValue({ docs: [] });
    mockSettlementsGet.mockResolvedValue({ docs: [] });

    // Chain: collection().doc().collection().get()
    const txCollectionRef = {
      get: mockTxGet,
    };
    const settlementsCollectionRef = {
      get: mockSettlementsGet,
    };
    const peopleCollectionRef = {
      get: mockPeopleGet,
    };
    const userDocRef = {
      collection: jest.fn((name: string) => {
        if (name === 'people') return peopleCollectionRef;
        if (name === 'settlements') return settlementsCollectionRef;
        return txCollectionRef;
      }),
    };

    mockDoc.mockReturnValue(userDocRef);
    mockCollection.mockReturnValue({ doc: mockDoc });
  });

  it('commits batch when user has no sub-documents', async () => {
    await cascadeDeleteUser('uid-abc');
    // Should still delete the user document itself
    expect(mockBatchDelete).toHaveBeenCalledTimes(1);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('deletes all transaction documents for each person', async () => {
    const tx1 = makeDocRef('tx-1');
    const tx2 = makeDocRef('tx-2');
    const person1 = {
      ref: {
        collection: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ docs: [tx1, tx2] }) }),
      },
    };

    mockPeopleGet.mockResolvedValue({ docs: [person1] });

    const userDocRef: any = {
      collection: jest.fn((name: string) => {
        if (name === 'people') return { get: mockPeopleGet };
        if (name === 'settlements') return { get: mockSettlementsGet };
        return { get: mockTxGet };
      }),
    };
    mockDoc.mockReturnValue(userDocRef);
    mockCollection.mockReturnValue({ doc: mockDoc });

    await cascadeDeleteUser('uid-abc');

    // tx-1, tx-2, person1, user doc = 4 deletes
    expect(mockBatchDelete).toHaveBeenCalledTimes(4);
  });

  it('deletes settlement documents', async () => {
    const s1 = makeDocRef('s-1');
    mockSettlementsGet.mockResolvedValue({ docs: [s1] });

    const userDocRef: any = {
      collection: jest.fn((name: string) => {
        if (name === 'people') return { get: mockPeopleGet };
        if (name === 'settlements') return { get: mockSettlementsGet };
        return { get: mockTxGet };
      }),
    };
    mockDoc.mockReturnValue(userDocRef);
    mockCollection.mockReturnValue({ doc: mockDoc });

    await cascadeDeleteUser('uid-abc');
    // settlement + user doc = 2
    expect(mockBatchDelete).toHaveBeenCalledTimes(2);
  });

  it('flushes batch when operation count reaches 500', async () => {
    // Create 501 transaction docs to trigger a mid-loop flush
    const txDocs = Array.from({ length: 501 }, (_, i) => makeDocRef(`tx-${i}`));
    const person1 = {
      ref: {
        collection: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ docs: txDocs }) }),
      },
    };

    mockPeopleGet.mockResolvedValue({ docs: [person1] });

    const userDocRef: any = {
      collection: jest.fn((name: string) => {
        if (name === 'people') return { get: mockPeopleGet };
        if (name === 'settlements') return { get: mockSettlementsGet };
        return { get: mockTxGet };
      }),
    };
    mockDoc.mockReturnValue(userDocRef);
    mockCollection.mockReturnValue({ doc: mockDoc });

    await cascadeDeleteUser('uid-abc');

    // Batch should have been committed more than once due to the 500 limit
    expect(mockBatchCommit.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
