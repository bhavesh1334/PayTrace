import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../types/models';

interface TransactionsState {
  byPersonId: Record<string, Transaction[]>;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  byPersonId: {},
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactionsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTransactionsForPerson: (
      state,
      action: PayloadAction<{ personId: string; transactions: Transaction[] }>
    ) => {
      const { personId, transactions } = action.payload;
      state.byPersonId[personId] = transactions;
      state.loading = false;
      state.error = null;
    },
    setTransactionsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTransactionsForPerson: (state, action: PayloadAction<string>) => {
      delete state.byPersonId[action.payload];
    },
  },
});

export const {
  setTransactionsLoading,
  setTransactionsForPerson,
  setTransactionsError,
  clearTransactionsForPerson,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
