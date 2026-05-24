import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';

type BalanceVariant = 'owed' | 'owing' | 'settled';

interface BalanceBadgeProps {
  amount: number;
  variant?: BalanceVariant;
  size?: 'sm' | 'md';
}

function getVariant(amount: number): BalanceVariant {
  if (amount > 0) return 'owed';
  if (amount < 0) return 'owing';
  return 'settled';
}

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  return `₹${abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function BalanceBadge({ amount, variant, size = 'md' }: BalanceBadgeProps) {
  const resolvedVariant = variant ?? getVariant(amount);

  const variantStyles = {
    owed: { bg: Colors.successSurface, text: Colors.success, label: 'GETS BACK' },
    owing: { bg: Colors.dangerSurface, text: Colors.danger, label: 'OWES' },
    settled: { bg: Colors.neutralSurface, text: Colors.neutral, label: 'SETTLED' },
  };

  const vs = variantStyles[resolvedVariant];

  return (
    <View style={[styles.badge, { backgroundColor: vs.bg }, size === 'sm' && styles.badgeSm]}>
      {size === 'md' && (
        <Text style={[styles.label, { color: vs.text }]}>{vs.label}</Text>
      )}
      <Text style={[styles.amount, { color: vs.text }, size === 'sm' && styles.amountSm]}>
        {resolvedVariant === 'settled' ? 'Settled' : formatAmount(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  label: {
    ...Typography.labelCaps,
    fontSize: 10,
  },
  amount: {
    ...Typography.numericMd,
    fontSize: 14,
  },
  amountSm: {
    fontSize: 12,
  },
});
