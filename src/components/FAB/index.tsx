import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { Shadows } from '../../design/shadows';

interface FABProps {
  onPress: () => void;
  icon?: string;
  accessibilityLabel?: string;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon = '＋',
  accessibilityLabel = 'Add new item',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, Shadows.fab]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.iconText}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xl + 8, // Ensure it floats beautifully above standard tab navigation or lists
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6, // Android shadow
  },
  iconText: {
    color: Colors.onPrimary,
    fontSize: 24,
    fontWeight: '600',
    marginTop: Platform.OS === 'ios' ? -2 : 0, // Visual centering adjustment
  },
});
