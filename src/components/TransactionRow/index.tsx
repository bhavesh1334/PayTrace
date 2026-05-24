import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '../../types/models';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { Timestamp } from 'firebase/firestore';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  onDelete?: () => void;
}

function formatDate(ts: Timestamp): string {
  const date = ts.toDate();
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function TransactionRow({ transaction, onPress, onDelete }: TransactionRowProps) {
  const isLent = transaction.direction === 'lent';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${isLent ? 'Lent' : 'Borrowed'} ${formatAmount(transaction.amount)} on ${formatDate(transaction.date)}`}
    >
      {/* Direction indicator */}
      <View style={[styles.indicator, { backgroundColor: isLent ? Colors.successSurface : Colors.dangerSurface }]}>
        <Text style={[styles.indicatorIcon, { color: isLent ? Colors.success : Colors.danger }]}>
          {isLent ? '↑' : '↓'}
        </Text>
      </View>

      {/* Note & date */}
      <View style={styles.details}>
        <Text style={styles.note} numberOfLines={1}>
          {transaction.note || (isLent ? 'Lent' : 'Borrowed')}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isLent ? Colors.success : Colors.danger }]}>
          {isLent ? '+' : '-'}{formatAmount(transaction.amount)}
        </Text>
        <Text style={styles.directionLabel}>{isLent ? 'you lent' : 'you borrowed'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.DEFAULT,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  indicator: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indicatorIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  note: {
    ...Typography.bodyLg,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  date: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...Typography.numericMd,
    fontSize: 15,
  },
  directionLabel: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
});
