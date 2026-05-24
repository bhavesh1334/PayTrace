/**
 * functions/src/callables/deleteUserAccount.test.ts
 * Unit tests for the deleteUserAccount Cloud Function callable.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../utils/cascadeDelete', () => ({
  cascadeDeleteUser: jest.fn().mockResolvedValue(undefined),
}));

const mockDeleteUser = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  app: jest.fn(() => ({})),
  auth: jest.fn(() => ({ deleteUser: mockDeleteUser })),
  firestore: Object.assign(jest.fn(() => ({})), {
    FieldValue: { serverTimestamp: jest.fn() },
  }),
}));

jest.mock('firebase-functions', () => ({
  https: {
    onCall: (handler: Function) => handler,
    HttpsError: class HttpsError extends Error {
      code: string;
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
    },
  },
}));

import { deleteUserAccount } from './deleteUserAccount';
import { cascadeDeleteUser } from '../utils/cascadeDelete';

// ─── Types ────────────────────────────────────────────────────────────────────

function makeContext(uid?: string) {
  return uid ? { auth: { uid } } : { auth: null };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('deleteUserAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cascadeDeleteUser as jest.Mock).mockResolvedValue(undefined);
    mockDeleteUser.mockResolvedValue(undefined);
  });

  it('throws unauthenticated error when no auth context', async () => {
    await expect(
      (deleteUserAccount as any)({}, makeContext())
    ).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('calls cascadeDeleteUser with the authenticated uid', async () => {
    const uid = 'user-abc-123';
    await (deleteUserAccount as any)({}, makeContext(uid));
    expect(cascadeDeleteUser).toHaveBeenCalledWith(uid);
  });

  it('calls admin.auth().deleteUser with the authenticated uid', async () => {
    const uid = 'user-abc-123';
    await (deleteUserAccount as any)({}, makeContext(uid));
    expect(mockDeleteUser).toHaveBeenCalledWith(uid);
  });

  it('returns success response on successful deletion', async () => {
    const result = await (deleteUserAccount as any)({}, makeContext('user-xyz'));
    expect(result).toEqual({
      success: true,
      message: 'Account successfully deleted.',
    });
  });

  it('throws internal error when cascadeDeleteUser fails', async () => {
    (cascadeDeleteUser as jest.Mock).mockRejectedValue(
      new Error('Firestore batch failed')
    );

    await expect(
      (deleteUserAccount as any)({}, makeContext('user-xyz'))
    ).rejects.toMatchObject({ code: 'internal' });
  });

  it('throws internal error when admin.auth().deleteUser fails', async () => {
    mockDeleteUser.mockRejectedValue(new Error('Auth record not found'));

    await expect(
      (deleteUserAccount as any)({}, makeContext('user-xyz'))
    ).rejects.toMatchObject({ code: 'internal' });
  });
});
