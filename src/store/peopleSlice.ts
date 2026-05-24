import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Person } from '../types/models';
import { RootState } from './index';

interface PeopleState {
  people: Person[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: PeopleState = {
  people: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    setPeopleLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPeople: (state, action: PayloadAction<Person[]>) => {
      state.people = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPeopleError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setPeopleLoading, setPeople, setPeopleError, setSearchQuery } =
  peopleSlice.actions;

// Base Selectors
const selectPeopleState = (state: RootState) => state.people;

export const selectAllPeople = createSelector(
  [selectPeopleState],
  (state) => state.people
);

export const selectSearchQuery = createSelector(
  [selectPeopleState],
  (state) => state.searchQuery
);

export const selectPeopleLoading = createSelector(
  [selectPeopleState],
  (state) => state.loading
);

// Derived Filtered Selectors
export const selectFilteredPeople = createSelector(
  [selectAllPeople, selectSearchQuery],
  (people, query) => {
    if (!query.trim()) return people;
    const lowerQuery = query.toLowerCase();
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(lowerQuery) ||
        (person.phone && person.phone.includes(lowerQuery)) ||
        (person.email && person.email.toLowerCase().includes(lowerQuery))
    );
  }
);

// Dashboard Totals Selector
// netBalance: positive means you lent more (people owe you overall), negative means you borrowed more (you owe overall)
export const selectNetSummary = createSelector([selectAllPeople], (people) => {
  let totalOwed = 0; // Cash people owe me (netBalance > 0)
  let totalOwing = 0; // Cash I owe people (netBalance < 0)

  people.forEach((person) => {
    const bal = person.cachedNetBalance || 0;
    if (bal > 0) {
      totalOwed += bal;
    } else if (bal < 0) {
      totalOwing += Math.abs(bal);
    }
  });

  const netBalance = totalOwed - totalOwing;

  return {
    totalOwed,
    totalOwing,
    netBalance,
  };
});

export default peopleSlice.reducer;
