import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Person } from '../../types/models';
import { BalanceBadge } from '../BalanceBadge';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { Shadows } from '../../design/shadows';

interface PersonCardProps {
  person: Person;
  onPress: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    '#1A56DB', '#065F46', '#991B1B', '#B45309', '#7C3AED',
    '#0F766E', '#DC2626', '#0284C7', '#16A34A', '#9333EA',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function PersonCard({ person, onPress }: PersonCardProps) {
  const avatarColor = getAvatarColor(person.name);
  const balance = person.cachedNetBalance || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${person.name}, balance ${balance >= 0 ? 'owed' : 'owing'} ${Math.abs(balance)}`}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(person.name)}</Text>
      </View>

      {/* Name & contact */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{person.name}</Text>
        {person.phone ? (
          <Text style={styles.sub} numberOfLines={1}>{person.phone}</Text>
        ) : person.email ? (
          <Text style={styles.sub} numberOfLines={1}>{person.email}</Text>
        ) : null}
      </View>

      {/* Balance badge */}
      <BalanceBadge amount={balance} size="sm" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.DEFAULT,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  sub: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
