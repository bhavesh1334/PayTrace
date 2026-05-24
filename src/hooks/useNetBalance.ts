import { useAppSelector } from '../store';
import { selectNetSummary } from '../store/peopleSlice';

export const useNetBalance = () => {
  return useAppSelector(selectNetSummary);
};
