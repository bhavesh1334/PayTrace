/**
 * src/hooks/useSessionTimeout.ts
 *
 * Monitors user inactivity and triggers biometric re-authentication
 * if the user has enabled biometrics in Settings.
 *
 * Strategy:
 * - Track last activity timestamp in AsyncStorage.
 * - On AppState change (foreground resume), check elapsed time.
 * - If elapsed > SESSION_TIMEOUT_MS and biometrics enabled → prompt re-auth.
 * - On re-auth failure → sign the user out for security.
 *
 * Usage:
 *   Call `useSessionTimeout()` once inside RootNavigator or App.tsx.
 *   Call `resetActivity()` in response to any user interaction if needed.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from './useAuth';

// ─── Config ──────────────────────────────────────────────────────────────────

/** How long (ms) before the session is considered expired on background. */
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const LAST_ACTIVE_KEY = '@paytrace/last_active_ts';
const BIOMETRIC_PREF_KEY = '@paytrace/biometrics_enabled';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSessionTimeout() {
  const { isAuthenticated, signOut } = useAuth();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isReAuthenticating = useRef(false);

  /** Persist current timestamp as last active time. */
  const recordActivity = useCallback(async () => {
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  /** Perform biometric challenge. Returns true on success. */
  const performBiometricChallenge = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify it\'s you to continue',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  };

  /** Called when the app returns to the foreground. */
  const handleAppForeground = useCallback(async () => {
    if (!isAuthenticated || isReAuthenticating.current) return;

    try {
      const [prefRaw, lastActiveRaw] = await Promise.all([
        AsyncStorage.getItem(BIOMETRIC_PREF_KEY),
        AsyncStorage.getItem(LAST_ACTIVE_KEY),
      ]);

      const biometricsEnabled = prefRaw === 'true';
      if (!biometricsEnabled) return;

      const lastActive = lastActiveRaw ? parseInt(lastActiveRaw, 10) : 0;
      const elapsed = Date.now() - lastActive;

      if (elapsed >= SESSION_TIMEOUT_MS) {
        isReAuthenticating.current = true;

        const ok = await performBiometricChallenge();
        if (!ok) {
          // Give user one more chance
          Alert.alert(
            'Authentication Required',
            'Biometric verification failed. Please try again.',
            [
              {
                text: 'Try Again',
                onPress: async () => {
                  const retryOk = await performBiometricChallenge();
                  if (!retryOk) {
                    await signOut();
                  } else {
                    await recordActivity();
                  }
                  isReAuthenticating.current = false;
                },
              },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                  isReAuthenticating.current = false;
                  await signOut();
                },
              },
            ],
            { cancelable: false },
          );
        } else {
          await recordActivity();
          isReAuthenticating.current = false;
        }
      }
    } catch (err) {
      isReAuthenticating.current = false;
      // Non-critical: don't crash the app on session check errors
    }
  }, [isAuthenticated, signOut, recordActivity]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Record initial activity when hook mounts (user just authenticated)
    recordActivity();

    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      const prev = appState.current;
      appState.current = nextState;

      if (prev.match(/inactive|background/) && nextState === 'active') {
        await handleAppForeground();
      }

      if (nextState.match(/inactive|background/)) {
        await recordActivity();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, handleAppForeground, recordActivity]);

  return { recordActivity };
}
