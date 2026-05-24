// Mock for @react-native-google-signin/google-signin
export const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue({
    idToken: 'mock-google-id-token',
    user: { email: 'google@example.com', name: 'Google User', id: 'google-uid' },
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  revokeAccess: jest.fn().mockResolvedValue(undefined),
  isSignedIn: jest.fn().mockResolvedValue(false),
  getCurrentUser: jest.fn().mockReturnValue(null),
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
};
