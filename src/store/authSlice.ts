import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../types/models';

interface AuthState {
  user: UserProfile | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setAuthUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'idle';
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setAuthLoading, setAuthUser, setAuthError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
