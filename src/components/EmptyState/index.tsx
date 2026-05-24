import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { Button } from '../Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '📭',
  title,
  subtitle,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onActionPress && (
        <Button
          label={actionLabel}
          onPress={onActionPress}
          variant="secondary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl * 1.5,
    backgroundColor: Colors.surface,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  actionBtn: {
    paddingHorizontal: Spacing.xl,
  },
});
