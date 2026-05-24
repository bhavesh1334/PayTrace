/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Silence native module imports
    '^expo-local-authentication$': '<rootDir>/tests/__mocks__/expo-local-authentication.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/tests/__mocks__/async-storage.ts',
    '^@react-native-google-signin/google-signin$': '<rootDir>/tests/__mocks__/google-signin.ts',
    '^@react-native-community/netinfo$': '<rootDir>/tests/__mocks__/netinfo.ts',
    '^firebase/(.*)$': '<rootDir>/tests/__mocks__/firebase.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|@react-navigation)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/data/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
