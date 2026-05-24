import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setPeople,
  setPeopleLoading,
  setPeopleError,
  setSearchQuery as setReduxSearchQuery,
  selectFilteredPeople,
  selectPeopleLoading,
} from '../store/peopleSlice';
import {
  subscribeToPeople,
  addPerson as apiAddPerson,
  updatePerson as apiUpdatePerson,
  deletePerson as apiDeletePerson,
} from '../services/peopleService';

export const usePeople = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const people = useAppSelector(selectFilteredPeople);
  const loading = useAppSelector(selectPeopleLoading);
  const error = useAppSelector((state) => state.people.error);
  const searchQuery = useAppSelector((state) => state.people.searchQuery);

  useEffect(() => {
    if (!authUser?.uid) return;

    dispatch(setPeopleLoading(true));
    const unsubscribe = subscribeToPeople(
      authUser.uid,
      (updatedPeople) => {
        dispatch(setPeople(updatedPeople));
      },
      (err) => {
        dispatch(setPeopleError(err.message || 'Failed to fetch people'));
      }
    );

    return unsubscribe;
  }, [authUser?.uid, dispatch]);

  const addPerson = async (name: string, phone?: string, email?: string) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    return await apiAddPerson(authUser.uid, { name, phone, email });
  };

  const updatePerson = async (personId: string, name: string, phone?: string, email?: string) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    await apiUpdatePerson(authUser.uid, personId, { name, phone, email });
  };

  const deletePerson = async (personId: string) => {
    if (!authUser?.uid) throw new Error('User not authenticated');
    await apiDeletePerson(authUser.uid, personId);
  };

  const setSearchQuery = (query: string) => {
    dispatch(setReduxSearchQuery(query));
  };

  return {
    people,
    loading,
    error,
    searchQuery,
    addPerson,
    updatePerson,
    deletePerson,
    setSearchQuery,
  };
};
