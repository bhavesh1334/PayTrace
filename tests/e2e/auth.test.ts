/**
 * tests/e2e/auth.test.ts
 * Integration tests for authentication Redux slice and service logic.
 * All Firebase calls are mocked — no real network requests.
 */

// ─── Mock Firebase before any imports ─────────────────────────────────────────

jest.mock('firebase/auth', () => require('../__mocks__/firebase'));
jest.mock('firebase/firestore', () => require('../__mocks__/firebase'));
jest.mock('firebase/app', () => require('../__mocks__/firebase'));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { googleWebClientId: 'mock-web-client-id' } } },
}));

// Mock the firebase service module
jest.mock('../../src/services/firebase', () => ({
  auth: {},
  db: {},
  functions: {},
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setAuthLoading,
  setAuthUser,
  setAuthError,
  clearAuth,
} from '../../src/store/authSlice';

const mockTimestamp = { toDate: () => new Date() } as any;

// ─── Store factory ────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Auth Redux Slice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('initial state is unauthenticated', () => {
    const { auth } = store.getState();
    expect(auth.status).toBe('idle');
    expect(auth.user).toBeNull();
    expect(auth.error).toBeNull();
  });

  it('setAuthLoading transitions to loading status', () => {
    store.dispatch(setAuthLoading());
    const { auth } = store.getState();
    expect(auth.status).toBe('loading');
  });

  it('setAuthUser sets user and transitions to authenticated', () => {
    const mockUser = {
      uid: 'uid-001',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: null,
      provider: 'email' as const,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    };
    store.dispatch(setAuthUser(mockUser));
    const { auth } = store.getState();
    expect(auth.status).toBe('authenticated');
    expect(auth.user).toEqual(mockUser);
    expect(auth.error).toBeNull();
  });

  it('setAuthError sets error message and status to unauthenticated', () => {
    store.dispatch(setAuthError('Invalid credentials'));
    const { auth } = store.getState();
    expect(auth.status).toBe('error');
    expect(auth.error).toBe('Invalid credentials');
  });

  it('clearAuth resets all auth state', () => {
    // First set a user
    store.dispatch(setAuthUser({
      uid: 'uid-001',
      displayName: 'User',
      email: 'user@example.com',
      photoURL: null,
      provider: 'email' as const,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    }));
    expect(store.getState().auth.status).toBe('authenticated');

    // Then clear
    store.dispatch(clearAuth());
    const { auth } = store.getState();
    expect(auth.status).toBe('idle');
    expect(auth.user).toBeNull();
    expect(auth.error).toBeNull();
  });

  it('loading → authenticated transition (simulating sign-in)', () => {
    store.dispatch(setAuthLoading());
    expect(store.getState().auth.status).toBe('loading');

    store.dispatch(setAuthUser({
      uid: 'uid-google',
      displayName: 'Google User',
      email: 'google@example.com',
      photoURL: 'https://example.com/photo.jpg',
      provider: 'google' as const,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    }));
    const { auth } = store.getState();
    expect(auth.status).toBe('authenticated');
    expect(auth.user?.provider).toBe('google');
  });

  it('loading → unauthenticated transition (simulating sign-in failure)', () => {
    store.dispatch(setAuthLoading());
    store.dispatch(setAuthError('auth/wrong-password'));
    const { auth } = store.getState();
    expect(auth.status).toBe('error');
    expect(auth.error).toBe('auth/wrong-password');
  });
});

// ─── Error handler tests ──────────────────────────────────────────────────────

describe('getReadableError — Firebase Auth codes', () => {
  let getReadableError: (error: unknown) => string;

  beforeAll(() => {
    ({ getReadableError } = require('../../src/utils/errorHandler'));
  });

  it('maps auth/user-not-found to friendly message', () => {
    const msg = getReadableError({ code: 'auth/user-not-found' });
    expect(msg).toContain('No account found');
  });

  it('maps auth/wrong-password to friendly message', () => {
    const msg = getReadableError({ code: 'auth/wrong-password' });
    expect(msg).toContain('Incorrect password');
  });

  it('maps auth/email-already-in-use to friendly message', () => {
    const msg = getReadableError({ code: 'auth/email-already-in-use' });
    expect(msg).toContain('already exists');
  });

  it('maps auth/network-request-failed to friendly message', () => {
    const msg = getReadableError({ code: 'auth/network-request-failed' });
    expect(msg).toContain('Network error');
  });

  it('maps unknown code to generic fallback', () => {
    const msg = getReadableError({ code: 'auth/some-unknown-code' });
    expect(msg).toContain('Error');
  });

  it('handles plain string errors', () => {
    const msg = getReadableError('Something went wrong');
    expect(msg).toBe('Something went wrong');
  });

  it('handles Error instances', () => {
    const msg = getReadableError(new Error('Network timeout'));
    expect(msg).toBe('Network timeout');
  });

  it('returns generic message for null/undefined', () => {
    expect(getReadableError(null)).toBe('An unexpected error occurred.');
    expect(getReadableError(undefined)).toBe('An unexpected error occurred.');
  });
});
