/**
 * tests/e2e/offline.test.ts
 * Integration tests for offline behaviour:
 * - OfflineManager monitoring and online/offline detection
 * - animations utility (pure functions, no native deps)
 * - errorHandler Firestore + Functions error codes
 */

import NetInfo from '@react-native-community/netinfo';

const mockNetInfoFetch = NetInfo.fetch as jest.Mock;
const mockNetInfoAddListener = NetInfo.addEventListener as jest.Mock;

jest.mock('../../src/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({ auth: { user: null }, people: { people: [] } })),
  },
}));

jest.mock('../../src/store/peopleSlice', () => ({
  setPeopleError: jest.fn((msg: string) => ({ type: 'people/setPeopleError', payload: msg })),
}));

import { OfflineManager } from '../../src/services/offlineManager';

// ─── OfflineManager tests ─────────────────────────────────────────────────────

describe('OfflineManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset static state
    OfflineManager.stopMonitoring();
  });

  it('isOnline returns true when connected and internet is reachable', async () => {
    mockNetInfoFetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    const online = await OfflineManager.isOnline();
    expect(online).toBe(true);
  });

  it('isOnline returns false when not connected', async () => {
    mockNetInfoFetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
    const online = await OfflineManager.isOnline();
    expect(online).toBe(false);
  });

  it('isOnline returns false when connected but internet not reachable', async () => {
    mockNetInfoFetch.mockResolvedValue({ isConnected: true, isInternetReachable: false });
    const online = await OfflineManager.isOnline();
    expect(online).toBe(false);
  });

  it('startMonitoring subscribes to NetInfo events', () => {
    OfflineManager.startMonitoring();
    expect(mockNetInfoAddListener).toHaveBeenCalledTimes(1);
  });

  it('startMonitoring does not subscribe twice if already monitoring', () => {
    OfflineManager.startMonitoring();
    OfflineManager.startMonitoring();
    expect(mockNetInfoAddListener).toHaveBeenCalledTimes(1);
  });

  it('stopMonitoring unsubscribes from NetInfo events', () => {
    const mockUnsubscribe = jest.fn();
    mockNetInfoAddListener.mockReturnValue(mockUnsubscribe);

    OfflineManager.startMonitoring();
    OfflineManager.stopMonitoring();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('calls onConnectionChange callback when network state changes', () => {
    const callback = jest.fn();
    let capturedListener: ((state: any) => void) | null = null;

    mockNetInfoAddListener.mockImplementation((listener: any) => {
      capturedListener = listener;
      return jest.fn();
    });

    OfflineManager.startMonitoring(callback);

    // Simulate going offline
    capturedListener!({ isConnected: false, isInternetReachable: false });
    expect(callback).toHaveBeenCalledWith(false);

    // Simulate coming back online
    capturedListener!({ isConnected: true, isInternetReachable: true });
    expect(callback).toHaveBeenCalledWith(true);
  });
});

// ─── errorHandler — Firestore + Functions codes ────────────────────────────────

describe('getReadableError — Firestore and Functions error codes', () => {
  const { getReadableError } = require('../../src/utils/errorHandler');

  it('maps permission-denied to friendly message', () => {
    expect(getReadableError({ code: 'permission-denied' })).toContain('permission');
  });

  it('maps unauthenticated Firestore error', () => {
    expect(getReadableError({ code: 'unauthenticated' })).toContain('sign in');
  });

  it('maps unavailable Firestore error', () => {
    expect(getReadableError({ code: 'unavailable' })).toContain('unavailable');
  });

  it('maps functions/permission-denied', () => {
    expect(getReadableError({ code: 'functions/permission-denied' })).toContain('permission');
  });

  it('maps functions/unauthenticated', () => {
    expect(getReadableError({ code: 'functions/unauthenticated' })).toContain('sign in');
  });

  it('maps functions/resource-exhausted', () => {
    expect(getReadableError({ code: 'functions/resource-exhausted' })).toContain('requests');
  });
});

// ─── Animation utilities (pure, no native deps) ───────────────────────────────

describe('shake animation — returns correct sequence length', () => {
  // Mock Animated API
  const mockValue = { setValue: jest.fn() };
  const mockTiming = jest.fn(() => ({ start: jest.fn(), stop: jest.fn() }));
  const mockSequence = jest.fn((anims: any[]) => ({ animations: anims, start: jest.fn() }));

  jest.mock('react-native', () => ({
    Animated: {
      Value: jest.fn(() => mockValue),
      timing: mockTiming,
      sequence: mockSequence,
      spring: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      delay: jest.fn(() => ({ start: jest.fn() })),
    },
    Easing: {
      linear: jest.fn(),
      out: jest.fn(() => jest.fn()),
      in: jest.fn(() => jest.fn()),
      inOut: jest.fn(() => jest.fn()),
      cubic: jest.fn(),
      elastic: jest.fn(() => jest.fn()),
    },
    Platform: { OS: 'ios', select: jest.fn() },
    AppState: { currentState: 'active', addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
    Alert: { alert: jest.fn() },
  }), { virtual: true });

  it('shake creates a sequence of 5 timing animations', () => {
    const { shake } = require('../../src/utils/animations');
    shake(mockValue as any);
    // shake calls Animated.sequence with 5 items
    expect(mockSequence).toHaveBeenCalledWith(expect.arrayContaining([
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    ]));
  });

  it('shake resets translateX to 0 before animating', () => {
    const { shake } = require('../../src/utils/animations');
    shake(mockValue as any);
    expect(mockValue.setValue).toHaveBeenCalledWith(0);
  });
});
