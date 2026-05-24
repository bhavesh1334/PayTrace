/**
 * tests/e2e/people.test.ts
 * Integration tests for the People Redux slice and derived selectors.
 */

jest.mock('firebase/auth', () => require('../__mocks__/firebase'));
jest.mock('firebase/firestore', () => require('../__mocks__/firebase'));
jest.mock('firebase/app', () => require('../__mocks__/firebase'));
jest.mock('../../src/services/firebase', () => ({ auth: {}, db: {}, functions: {} }));

import { configureStore } from '@reduxjs/toolkit';
import peopleReducer, {
  setPeople,
  setPeopleLoading,
  setPeopleError,
  setSearchQuery,
  selectAllPeople,
  selectFilteredPeople,
  selectNetSummary,
} from '../../src/store/peopleSlice';
import authReducer from '../../src/store/authSlice';
import { Person } from '../../src/types/models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({
    reducer: { people: peopleReducer, auth: authReducer },
  });
}

function makePerson(overrides: Partial<Person> = {}): Person {
  const mockTimestamp = { toDate: () => new Date() } as any;
  return {
    personId: 'p-test',
    name: 'Alice',
    phone: '9876543210',
    email: 'alice@example.com',
    cachedNetBalance: 0,
    isArchived: false,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('People Redux Slice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts with empty people list', () => {
    const people = selectAllPeople(store.getState() as any);
    expect(people).toEqual([]);
  });

  it('setPeople populates the list and clears loading', () => {
    store.dispatch(setPeopleLoading(true));
    const people = [makePerson({ personId: 'p1' }), makePerson({ personId: 'p2', name: 'Bob' })];
    store.dispatch(setPeople(people));

    const state = store.getState().people;
    expect(state.loading).toBe(false);
    expect(state.people).toHaveLength(2);
    expect(state.error).toBeNull();
  });

  it('setPeopleError sets error and stops loading', () => {
    store.dispatch(setPeopleLoading(true));
    store.dispatch(setPeopleError('Firestore read failed'));

    const state = store.getState().people;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Firestore read failed');
  });
});

describe('selectFilteredPeople selector', () => {
  let store: ReturnType<typeof makeStore>;
  const people: Person[] = [
    makePerson({ personId: 'p1', name: 'Alice Smith', phone: '1111111111', email: 'alice@example.com' }),
    makePerson({ personId: 'p2', name: 'Bob Jones', phone: '2222222222', email: 'bob@example.com' }),
    makePerson({ personId: 'p3', name: 'Charlie Brown', phone: '3333333333', email: 'charlie@example.com' }),
  ];

  beforeEach(() => {
    store = makeStore();
    store.dispatch(setPeople(people));
  });

  it('returns all people when search query is empty', () => {
    const filtered = selectFilteredPeople(store.getState() as any);
    expect(filtered).toHaveLength(3);
  });

  it('filters by name (case-insensitive)', () => {
    store.dispatch(setSearchQuery('alice'));
    const filtered = selectFilteredPeople(store.getState() as any);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Alice Smith');
  });

  it('filters by partial name', () => {
    store.dispatch(setSearchQuery('bo'));
    const filtered = selectFilteredPeople(store.getState() as any);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Bob Jones');
  });

  it('filters by phone number', () => {
    store.dispatch(setSearchQuery('3333'));
    const filtered = selectFilteredPeople(store.getState() as any);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Charlie Brown');
  });

  it('filters by email', () => {
    store.dispatch(setSearchQuery('bob@'));
    const filtered = selectFilteredPeople(store.getState() as any);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Bob Jones');
  });

  it('returns empty array when no matches', () => {
    store.dispatch(setSearchQuery('zzz-no-match'));
    const filtered = selectFilteredPeople(store.getState() as any);
    expect(filtered).toHaveLength(0);
  });
});

describe('selectNetSummary selector', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('returns all zeroes for empty people list', () => {
    const summary = selectNetSummary(store.getState() as any);
    expect(summary).toEqual({ totalOwed: 0, totalOwing: 0, netBalance: 0 });
  });

  it('sums positive cachedNetBalance as totalOwed', () => {
    store.dispatch(setPeople([
      makePerson({ personId: 'p1', cachedNetBalance: 100 }),
      makePerson({ personId: 'p2', cachedNetBalance: 50 }),
    ]));
    const { totalOwed, totalOwing, netBalance } = selectNetSummary(store.getState() as any);
    expect(totalOwed).toBe(150);
    expect(totalOwing).toBe(0);
    expect(netBalance).toBe(150);
  });

  it('sums negative cachedNetBalance as totalOwing', () => {
    store.dispatch(setPeople([
      makePerson({ personId: 'p1', cachedNetBalance: -200 }),
      makePerson({ personId: 'p2', cachedNetBalance: -30 }),
    ]));
    const { totalOwed, totalOwing, netBalance } = selectNetSummary(store.getState() as any);
    expect(totalOwed).toBe(0);
    expect(totalOwing).toBe(230);
    expect(netBalance).toBe(-230);
  });

  it('computes correct net when mix of positive and negative balances', () => {
    store.dispatch(setPeople([
      makePerson({ personId: 'p1', cachedNetBalance: 500 }),   // someone owes me
      makePerson({ personId: 'p2', cachedNetBalance: -200 }),  // I owe them
      makePerson({ personId: 'p3', cachedNetBalance: 0 }),     // settled
    ]));
    const { totalOwed, totalOwing, netBalance } = selectNetSummary(store.getState() as any);
    expect(totalOwed).toBe(500);
    expect(totalOwing).toBe(200);
    expect(netBalance).toBe(300);
  });
});
