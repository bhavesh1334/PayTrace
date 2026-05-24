/**
 * functions/src/triggers/onUserCreated.test.ts
 * Unit tests for the onUserCreated Auth trigger.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSet = jest.fn().mockResolvedValue(undefined);
jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnValue({ set: mockSet }),
    FieldValue: { serverTimestamp: jest.fn(() => 'SERVER_TS') },
  };

  const firestoreFn = Object.assign(jest.fn(() => firestoreMock), {
    FieldValue: { serverTimestamp: jest.fn(() => 'SERVER_TS') },
  });

  return {
    initializeApp: jest.fn(),
    app: jest.fn(() => ({})),
    auth: jest.fn(() => ({})),
    firestore: firestoreFn,
  };
});

jest.mock('firebase-functions', () => ({
  auth: {
    user: jest.fn(() => ({
      onCreate: (handler: Function) => handler,
    })),
  },
}));

import { onUserCreated } from './onUserCreated';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<any> = {}) {
  return {
    uid: 'test-uid',
    displayName: 'John Doe',
    email: 'john@example.com',
    photoURL: 'https://example.com/photo.jpg',
    providerData: [{ providerId: 'password' }],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('onUserCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSet.mockResolvedValue(undefined);
  });

  it('creates a user profile document with correct fields', async () => {
    const user = makeUser();
    await (onUserCreated as any)(user);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: 'test-uid',
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg',
        provider: 'email',
      }),
      { merge: true }
    );
  });

  it('defaults displayName to "User" when null', async () => {
    const user = makeUser({ displayName: null });
    await (onUserCreated as any)(user);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'User' }),
      { merge: true }
    );
  });

  it('defaults email to empty string when null', async () => {
    const user = makeUser({ email: null });
    await (onUserCreated as any)(user);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ email: '' }),
      { merge: true }
    );
  });

  it('sets provider to "google" for Google Sign-In accounts', async () => {
    const user = makeUser({ providerData: [{ providerId: 'google.com' }] });
    await (onUserCreated as any)(user);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' }),
      { merge: true }
    );
  });

  it('sets provider to "email" for non-Google accounts', async () => {
    const user = makeUser({ providerData: [{ providerId: 'password' }] });
    await (onUserCreated as any)(user);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'email' }),
      { merge: true }
    );
  });

  it('includes timestamps in the profile document', async () => {
    const user = makeUser();
    await (onUserCreated as any)(user);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: 'SERVER_TS',
        updatedAt: 'SERVER_TS',
      }),
      { merge: true }
    );
  });

  it('does not throw when Firestore set fails (logs error)', async () => {
    mockSet.mockRejectedValue(new Error('Firestore write failed'));
    const user = makeUser();

    // Should not throw — trigger swallows errors
    await expect((onUserCreated as any)(user)).resolves.toBeUndefined();
  });
});
