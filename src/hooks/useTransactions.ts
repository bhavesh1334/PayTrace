import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setTransactionsForPerson,
  setTransactionsLoading,
  setTransactionsError,
  clearTransactionsForPerson,
} from '../store/transactionsSlice';
import {
  subscribeToTransactions,
  addTransaction as apiAddTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
  settleAll as apiSettleAll,
} from '../services/transactionService';
import { TransactionDirection } from '../types/models';

export const useTransactions = (personId?: string) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const transactions = useAppSelector(
    (state) => (personId ? state.transactions.byPersonId[personId] : []) || []
  );
  const loading = useAppSelector((state) => state.transactions.loading);
  const error = useAppSelector((state) => state.transactions.error);

  useEffect(() => {
    if (!authUser?.uid || !personId) return;

    dispatch(setTransactionsLoading(true));
    const unsubscribe = subscribeToTransactions(
      authUser.uid,
      personId,
      (updatedTxs) => {
        dispatch(
          setTransactionsForPerson({
            personId,
            transactions: updatedTxs,
          })
        );
      },
      (err) => {
        dispatch(setTransactionsError(err.message || 'Failed to fetch transactions'));
      }
    );

    return () => {
      unsubscribe();
      // Keep state cached in Redux for fast back navigations, or clear if needed.
    };
  }, [authUser?.uid, personId, dispatch]);

  const addTransaction = async (
    targetPersonId: string,
    amount: number,
    direction: TransactionDirection,
    date: Date,
    note?: string
  ) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    return await apiAddTransaction(authUser.uid, targetPersonId, {
      amount,
      direction,
      date,
      note,
    });
  };

  const updateTransaction = async (
    targetPersonId: string,
    txId: string,
    amount: number,
    direction: TransactionDirection,
    date: Date,
    note?: string
  ) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    await apiUpdateTransaction(authUser.uid, targetPersonId, txId, {
      amount,
      direction,
      date,
      note,
    });
  };

  const deleteTransaction = async (targetPersonId: string, txId: string) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    await apiDeleteTransaction(authUser.uid, targetPersonId, txId);
  };

  const settlePerson = async (targetPersonId: string, personName: string) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    await apiSettleAll(authUser.uid, targetPersonId, personName);
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    settlePerson,
  };
};
