// Mock for expo-local-authentication
export const hasHardwareAsync = jest.fn().mockResolvedValue(true);
export const isEnrolledAsync = jest.fn().mockResolvedValue(true);
export const authenticateAsync = jest.fn().mockResolvedValue({ success: true });
export const AuthenticationType = { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 };
export const SecurityLevel = { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 };
