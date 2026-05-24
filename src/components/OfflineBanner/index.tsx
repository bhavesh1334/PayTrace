import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors, Typography, Spacing } from '../../design/tokens';
import { OfflineManager } from '../../services/offlineManager';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start hidden above view

  useEffect(() => {
    OfflineManager.startMonitoring((isConnected) => {
      setIsOffline(!isConnected);
    });

    return () => {
      OfflineManager.stopMonitoring();
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      Animated.spring(slideAnim, {
        toValue: 0, // Slide down to show
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100, // Slide back up to hide
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline && (slideAnim as any)._value === -100) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>⚠️ You are currently offline. Changes will sync when online.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.danger,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 5,
  },
  text: {
    ...Typography.bodySm,
    color: Colors.onPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
