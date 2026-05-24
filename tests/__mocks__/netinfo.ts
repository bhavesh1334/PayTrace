// Mock for @react-native-community/netinfo
let _isConnected = true;

const NetInfo = {
  fetch: jest.fn(async () => ({ isConnected: _isConnected, type: 'wifi' })),
  addEventListener: jest.fn((listener: (state: any) => void) => {
    // Return unsubscribe function
    return jest.fn();
  }),
  useNetInfo: jest.fn(() => ({ isConnected: _isConnected, type: 'wifi' })),
  // Test helper to simulate going offline/online
  __setConnected: (value: boolean) => { _isConnected = value; },
};

export default NetInfo;
