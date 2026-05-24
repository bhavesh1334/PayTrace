/**
 * jest.setup.ts
 * Global test setup — mocks all native modules that aren't available in Node.
 */

// Silence React Native's annoying console.error for known issues
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('act(...)') ||
        args[0].includes('A non-serializable value was detected'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
