/**
 * tests/__mocks__/firebase.ts
 * Comprehensive mock for the Firebase JS SDK v10.
 * Covers: auth, firestore, functions sub-modules.
 */

// ─── Auth mocks ───────────────────────────────────────────────────────────────

export const onAuthStateChanged = jest.fn((auth: any, callback: any) => {
  // By default, call with null (unauthenticated)
  callback(null);
  return jest.fn(); // unsubscribe
});

export const signInWithEmailAndPassword = jest.fn().mockResolvedValue({
  user: { uid: 'mock-uid', email: 'test@example.com', displayName: 'Test User', providerData: [] },
});

export const createUserWithEmailAndPassword = jest.fn().mockResolvedValue({
  user: { uid: 'new-uid', email: 'new@example.com', displayName: null, providerData: [] },
});

export const sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);

export const signOut = jest.fn().mockResolvedValue(undefined);

export const GoogleAuthProvider = {
  credential: jest.fn().mockReturnValue({ providerId: 'google.com', token: 'mock-token' }),
};

export const signInWithCredential = jest.fn().mockResolvedValue({
  user: { uid: 'google-uid', email: 'google@example.com', displayName: 'Google User', providerData: [{ providerId: 'google.com' }] },
});

// ─── Firestore mocks ──────────────────────────────────────────────────────────

export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn().mockResolvedValue({ exists: () => false, data: () => null });
export const getDocs = jest.fn().mockResolvedValue({ docs: [], forEach: jest.fn() });
export const setDoc = jest.fn().mockResolvedValue(undefined);
export const updateDoc = jest.fn().mockResolvedValue(undefined);
export const deleteDoc = jest.fn().mockResolvedValue(undefined);
export const addDoc = jest.fn().mockResolvedValue({ id: 'new-doc-id' });
export const query = jest.fn((ref: any) => ref);
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const onSnapshot = jest.fn((ref: any, callback: any) => {
  callback({ docs: [], forEach: jest.fn() });
  return jest.fn();
});
export const serverTimestamp = jest.fn(() => new Date().toISOString());
export const Timestamp = {
  fromDate: (d: Date) => ({ toDate: () => d }),
  now: () => ({ toDate: () => new Date() }),
};
export const writeBatch = jest.fn(() => ({
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn().mockResolvedValue(undefined),
}));
export const runTransaction = jest.fn();

// ─── Functions mocks ──────────────────────────────────────────────────────────

export const getFunctions = jest.fn(() => ({}));
export const httpsCallable = jest.fn(() => jest.fn().mockResolvedValue({ data: {} }));

// ─── App init ─────────────────────────────────────────────────────────────────

export const initializeApp = jest.fn(() => ({}));
export const getApp = jest.fn(() => ({}));
export const getApps = jest.fn(() => []);
