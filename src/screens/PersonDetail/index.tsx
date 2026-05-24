import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { usePeople } from '../../hooks/usePeople';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionRow } from '../../components/TransactionRow';
import { BalanceBadge } from '../../components/BalanceBadge';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { Button } from '../../components/Button';
import { BottomSheet } from '../../components/BottomSheet';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'PersonDetail'>;

export default function PersonDetailScreen({ route, navigation }: Props) {
  const { personId, personName } = route.params;
  const { people, deletePerson } = usePeople();
  const { transactions, loading, error, deleteTransaction, settlePerson } = useTransactions(personId);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settling, setSettling] = useState(false);

  // Retrieve latest cached fields from Redux hook
  const person = people.find((p) => p.personId === personId);
  const currentName = person?.name || personName;
  const netBalance = person?.cachedNetBalance ?? 0;

  const handleEditPerson = () => {
    navigation.navigate('EditPerson', { personId });
  };

  const handleDeleteContact = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${currentName}? This will permanentely delete all history associated with them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePerson(personId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  const handleSettle = async () => {
    setSettling(true);
    try {
      await settlePerson(personId, currentName);
      setShowSettleModal(false);
      Alert.alert('Success', `${currentName} settled successfully!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to settle balance');
    } finally {
      setSettling(false);
    }
  };

  const handleDeleteTx = (txId: string, note?: string) => {
    Alert.alert(
      'Delete Transaction',
      `Delete transaction ${note ? `"${note}"` : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(personId, txId);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    return `₹${absVal.toLocaleString('en-IN')}`;
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          accessibilityLabel="Go back"
        >
          <Text style={styles.btnIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Details
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleEditPerson}
            style={[styles.circleBtn, styles.marginRight]}
            accessibilityLabel="Edit contact"
          >
            <Text style={styles.btnIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteContact}
            style={styles.circleBtn}
            accessibilityLabel="Delete contact"
          >
            <Text style={styles.btnIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile summary header */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(currentName)}</Text>
        </View>
        <Text style={styles.nameText}>{currentName}</Text>
        
        {person?.phone && <Text style={styles.contactText}>📞 {person.phone}</Text>}
        {person?.email && <Text style={styles.contactText}>✉️ {person.email}</Text>}

        <View style={styles.balanceContainer}>
          <BalanceBadge amount={netBalance} />
        </View>

        {netBalance !== 0 && (
          <Button
            label="Settle Balance"
            variant="primary"
            style={styles.settleBtn}
            onPress={() => setShowSettleModal(true)}
          />
        )}
      </View>

      {/* Transaction History label */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
      </View>

      {/* Transactions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : transactions.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="No history yet"
          subtitle={`Add lent/borrowed transactions to start tracking what you share with ${currentName}`}
          actionLabel="Add Transaction"
          onActionPress={() => navigation.navigate('AddTransaction', { personId, personName: currentName })}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.txId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onPress={() => handleDeleteTx(item.txId, item.note)}
            />
          )}
        />
      )}

      {/* Floating Button to Add Transaction */}
      <FAB
        onPress={() => navigation.navigate('AddTransaction', { personId, personName: currentName })}
        accessibilityLabel="Add new transaction"
      />

      {/* Settlement Confirmation Bottom Sheet */}
      <BottomSheet
        visible={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        title="Confirm Settlement"
      >
        <View style={styles.settleModalContent}>
          <Text style={styles.settleModalDesc}>
            Are you sure you want to mark all outstanding balances with{' '}
            <Text style={{ fontWeight: '700' }}>{currentName}</Text> as settled?
          </Text>
          <View style={styles.settleSummaryRow}>
            <Text style={styles.settleSummaryLabel}>
              {netBalance > 0 ? 'They pay you:' : 'You pay them:'}
            </Text>
            <Text
              style={[
                styles.settleSummaryVal,
                netBalance > 0 ? styles.colorSuccess : styles.colorDanger,
              ]}
            >
              {formatCurrency(netBalance)}
            </Text>
          </View>
          <View style={styles.settleActions}>
            <Button
              label="Cancel"
              variant="outline"
              style={styles.settleCancelBtn}
              onPress={() => setShowSettleModal(false)}
            />
            <Button
              label="Settle All"
              loading={settling}
              style={styles.settleConfirmBtn}
              onPress={handleSettle}
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  headerTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginRight: {
    marginRight: Spacing.xs,
  },
  btnIcon: {
    fontSize: 16,
    color: Colors.neutral,
  },
  profileBox: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.headlineLg,
    color: Colors.primary,
    fontSize: 22,
  },
  nameText: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  contactText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  balanceContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  settleBtn: {
    width: '100%',
    height: 40,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.labelCaps,
    color: Colors.outline,
    fontSize: 11,
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.bodyLg,
    color: Colors.error,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl * 3,
    gap: Spacing.cardGap,
  },
  settleModalContent: {
    paddingVertical: Spacing.md,
  },
  settleModalDesc: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  settleSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.xl,
  },
  settleSummaryLabel: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  settleSummaryVal: {
    ...Typography.headlineLg,
  },
  settleActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  settleCancelBtn: {
    flex: 1,
  },
  settleConfirmBtn: {
    flex: 1,
  },
  colorSuccess: {
    color: Colors.success,
  },
  colorDanger: {
    color: Colors.danger,
  },
});
