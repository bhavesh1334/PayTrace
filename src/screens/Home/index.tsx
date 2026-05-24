import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { usePeople } from '../../hooks/usePeople';
import { useNetBalance } from '../../hooks/useNetBalance';
import { PersonCard } from '../../components/PersonCard';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

type HomeNavProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { people, loading, error, searchQuery, setSearchQuery } = usePeople();
  const { netBalance, totalOwed, totalOwing } = useNetBalance();

  const handlePersonPress = (personId: string, name: string) => {
    navigation.navigate('PersonDetail', { personId, personName: name });
  };

  const getBalanceStyle = () => {
    if (netBalance > 0) return styles.netOwed;
    if (netBalance < 0) return styles.netOwing;
    return styles.netSettled;
  };

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    return `₹${absVal.toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Ledger</Text>
          <Text style={styles.subWelcome}>Track your shared balances</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.profileBtn}
          accessibilityLabel="Go to Settings"
        >
          <Text style={styles.profileBtnText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Net Balance Card */}
      <View style={styles.summaryCard}>
        <View style={styles.netSection}>
          <Text style={styles.netLabel}>NET STATUS</Text>
          <Text style={[styles.netAmount, getBalanceStyle()]}>
            {netBalance === 0 ? 'Settled' : formatCurrency(netBalance)}
          </Text>
          <Text style={styles.netSubText}>
            {netBalance > 0
              ? 'people owe you in total'
              : netBalance < 0
              ? 'you owe people in total'
              : 'all clear!'}
          </Text>
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownTitle, styles.colorSuccess]}>YOU GET</Text>
            <Text style={[styles.breakdownValue, styles.colorSuccess]}>
              {formatCurrency(totalOwed)}
            </Text>
          </View>
          <View style={styles.breakdownVerticalDivider} />
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownTitle, styles.colorDanger]}>YOU OWE</Text>
            <Text style={[styles.breakdownValue, styles.colorDanger]}>
              {formatCurrency(totalOwing)}
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search people..."
          placeholderTextColor={Colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity
            style={styles.clearSearch}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : people.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="No contacts found"
          subtitle={
            searchQuery
              ? "Try searching for a different name"
              : "Tap the + button to add a friend and start tracing transactions"
          }
          actionLabel={searchQuery ? "Clear Search" : "Add a Person"}
          onActionPress={searchQuery ? () => setSearchQuery('') : () => navigation.navigate('AddPerson')}
        />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.personId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PersonCard
              person={item}
              onPress={() => handlePersonPress(item.personId, item.name)}
            />
          )}
        />
      )}

      {/* Floating Action Button */}
      <FAB
        onPress={() => navigation.navigate('AddPerson')}
        accessibilityLabel="Add new person"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  welcomeText: {
    ...Typography.headlineLg,
    fontSize: 26,
    color: Colors.onSurface,
  },
  subWelcome: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtnText: {
    fontSize: 18,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.lg,
  },
  netSection: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  netLabel: {
    ...Typography.labelCaps,
    color: Colors.outline,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  netAmount: {
    ...Typography.displayBal,
    marginVertical: Spacing.xs,
  },
  netOwed: {
    color: Colors.success,
  },
  netOwing: {
    color: Colors.danger,
  },
  netSettled: {
    color: Colors.neutral,
  },
  netSubText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginVertical: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownVerticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.outlineVariant,
  },
  breakdownTitle: {
    ...Typography.labelCaps,
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  breakdownValue: {
    ...Typography.numericMd,
    fontSize: 18,
  },
  colorSuccess: {
    color: Colors.success,
  },
  colorDanger: {
    color: Colors.danger,
  },
  searchContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    height: 44,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.DEFAULT,
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.xl * 1.5,
    color: Colors.onSurface,
    ...Typography.bodySm,
  },
  clearSearch: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.xs,
  },
  clearSearchText: {
    fontSize: 14,
    color: Colors.outline,
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
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl * 3, // Allow scrolling above FAB
    gap: Spacing.cardGap,
  },
});
