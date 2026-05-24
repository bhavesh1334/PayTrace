/**
 * tests/e2e/transactions.test.ts
 * Integration tests for Transactions Redux slice, selectors, and service validation.
 */

jest.mock('firebase/auth', () => require('../__mocks__/firebase'));
jest.mock('firebase/firestore', () => require('../__mocks__/firebase'));
jest.mock('firebase/app', () => require('../__mocks__/firebase'));
jest.mock('../../src/services/firebase', () => ({ auth: {}, db: {}, functions: {} }));

import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer, {
  setTransactionsForPerson,
  setTransactionsLoading,
  setTransactionsError,
  clearTransactionsForPerson,
} from '../../src/store/transactionsSlice';
import { Transaction } from '../../src/types/models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({ reducer: { transactions: transactionsReducer } });
}

function makeTx(overrides: Partial<Transaction & { personId?: string }> = {}): Transaction {
  const mockTimestamp = { toDate: () => new Date() } as any;
  const { personId, ...rest } = overrides;
  return {
    txId: 'tx-1',
    amount: 100,
    direction: 'lent',
    date: mockTimestamp,
    note: 'Test transaction',
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    ...rest,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Transactions Redux Slice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts with empty byPersonId map', () => {
    expect(store.getState().transactions.byPersonId).toEqual({});
  });

  it('setTransactionsForPerson populates transactions by personId', () => {
    const txs = [makeTx({ txId: 'tx-1' }), makeTx({ txId: 'tx-2' })];
    store.dispatch(setTransactionsForPerson({ personId: 'p-1', transactions: txs }));

    const state = store.getState().transactions;
    expect(state.byPersonId['p-1']).toHaveLength(2);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('stores transactions separately per person', () => {
    const txsP1 = [makeTx({ txId: 'tx-1', personId: 'p-1' })];
    const txsP2 = [makeTx({ txId: 'tx-2', personId: 'p-2' }), makeTx({ txId: 'tx-3', personId: 'p-2' })];

    store.dispatch(setTransactionsForPerson({ personId: 'p-1', transactions: txsP1 }));
    store.dispatch(setTransactionsForPerson({ personId: 'p-2', transactions: txsP2 }));

    const state = store.getState().transactions;
    expect(state.byPersonId['p-1']).toHaveLength(1);
    expect(state.byPersonId['p-2']).toHaveLength(2);
  });

  it('setTransactionsError sets error message', () => {
    store.dispatch(setTransactionsLoading(true));
    store.dispatch(setTransactionsError('Read failed'));

    const state = store.getState().transactions;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Read failed');
  });

  it('clearTransactionsForPerson removes only the specified person', () => {
    store.dispatch(setTransactionsForPerson({ personId: 'p-1', transactions: [makeTx()] }));
    store.dispatch(setTransactionsForPerson({ personId: 'p-2', transactions: [makeTx({ txId: 'tx-2' })] }));

    store.dispatch(clearTransactionsForPerson('p-1'));

    const state = store.getState().transactions;
    expect(state.byPersonId['p-1']).toBeUndefined();
    expect(state.byPersonId['p-2']).toHaveLength(1);
  });
});

// ─── balanceCalculator tests (also used in functions) ────────────────────────

describe('calculateNetBalance — Transaction direction logic', () => {
  // Import pure function (no Firebase deps)
  const { calculateNetBalance } = require('../../functions/src/utils/balanceCalculator');

  it('returns 0 for empty transaction array', () => {
    expect(calculateNetBalance([])).toBe(0);
  });

  it('sums lent transactions as positive', () => {
    expect(calculateNetBalance([
      { amount: 250, direction: 'lent' },
      { amount: 75, direction: 'lent' },
    ])).toBe(325);
  });

  it('sums borrowed transactions as negative', () => {
    expect(calculateNetBalance([
      { amount: 100, direction: 'borrowed' },
    ])).toBe(-100);
  });

  it('computes correct net for mixed directions', () => {
    // +500 - 200 + 100 - 50 = 350
    expect(calculateNetBalance([
      { amount: 500, direction: 'lent' },
      { amount: 200, direction: 'borrowed' },
      { amount: 100, direction: 'lent' },
      { amount: 50, direction: 'borrowed' },
    ])).toBe(350);
  });

  it('handles decimal amounts correctly', () => {
    expect(calculateNetBalance([
      { amount: 10.5, direction: 'lent' },
      { amount: 3.25, direction: 'borrowed' },
    ])).toBeCloseTo(7.25);
  });

  it('handles single large transaction', () => {
    expect(calculateNetBalance([{ amount: 1_000_000, direction: 'lent' }])).toBe(1_000_000);
  });
});

// ─── Transaction validation via Zod schema ────────────────────────────────────

describe('Transaction schema validation', () => {
  const { AddTransactionSchema } = require('../../src/utils/schemas');

  it('passes with valid lent transaction', () => {
    const result = AddTransactionSchema.safeParse({
      amount: 100,
      direction: 'lent',
      date: new Date(),
      note: 'Lunch money',
    });
    expect(result.success).toBe(true);
  });

  it('passes with valid borrowed transaction', () => {
    const result = AddTransactionSchema.safeParse({
      amount: 50,
      direction: 'borrowed',
      date: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('fails when amount is zero', () => {
    const result = AddTransactionSchema.safeParse({
      amount: 0,
      direction: 'lent',
      date: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('fails when amount is negative', () => {
    const result = AddTransactionSchema.safeParse({
      amount: -50,
      direction: 'lent',
      date: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('fails with invalid direction', () => {
    const result = AddTransactionSchema.safeParse({
      amount: 100,
      direction: 'invalid',
      date: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('fails when amount is missing', () => {
    const result = AddTransactionSchema.safeParse({
      direction: 'lent',
      date: new Date(),
    });
    expect(result.success).toBe(false);
  });
});
