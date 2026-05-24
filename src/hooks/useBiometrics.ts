import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_PREF_KEY = '@paytrace/biometrics_enabled';

export const useBiometrics = () => {
  const [isCompatible, setIsCompatible] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkCompatibility = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(compatible);

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsCompatible(compatible && enrolled);

      const pref = await AsyncStorage.getItem(BIOMETRIC_PREF_KEY);
      setIsEnabled(pref === 'true');
    };

    checkCompatibility();
  }, []);

  const enableBiometrics = async () => {
    if (!isCompatible) throw new Error('Biometric hardware not enrolled/compatible');
    
    // First challenge to verify
    const success = await authenticate();
    if (success) {
      await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, 'true');
      setIsEnabled(true);
      return true;
    }
    return false;
  };

  const disableBiometrics = async () => {
    await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, 'false');
    setIsEnabled(false);
  };

  const authenticate = async (reason = 'Unlock your PayTrace ledger') => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  return {
    isCompatible,
    hasHardware,
    isEnabled,
    enableBiometrics,
    disableBiometrics,
    authenticate,
  };
};
