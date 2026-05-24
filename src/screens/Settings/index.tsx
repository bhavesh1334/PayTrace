import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { useAuth } from '../../hooks/useAuth';
import { useBiometrics } from '../../hooks/useBiometrics';
import { Button } from '../../components/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { user, signOut, isLoading } = useAuth();
  const { isCompatible, isEnabled, enableBiometrics, disableBiometrics } = useBiometrics();

  const handleToggleBiometrics = async (value: boolean) => {
    try {
      if (value) {
        const success = await enableBiometrics();
        if (!success) {
          Alert.alert('Authentication Failed', 'Could not enable biometric lock');
        }
      } else {
        await disableBiometrics();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Biometrics setting failed');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName ? getInitials(user.displayName) : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'name@example.com'}</Text>
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>
              Logged in via {user?.provider === 'google' ? 'Google Social' : 'Email Account'}
            </Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
        </View>

        <View style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Biometric Unlock</Text>
              <Text style={styles.prefDesc}>
                {isCompatible
                  ? 'Require TouchID / FaceID to open ledger'
                  : 'Biometric hardware unavailable or not enrolled'}
              </Text>
            </View>
            <Switch
              disabled={!isCompatible}
              value={isEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: Colors.outlineVariant, true: Colors.successSurface }}
              thumbColor={isEnabled ? Colors.success : Colors.outline}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
        </View>

        <View style={styles.prefCard}>
          <View style={[styles.prefRow, styles.borderBottom]}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (Expo SDK 51)</Text>
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.infoLabel}>Powered by</Text>
            <Text style={styles.infoValue}>Cloud Firestore + Functions</Text>
          </View>
        </View>

        {/* Logout Action */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          loading={isLoading}
          style={styles.signOutBtn}
          labelStyle={styles.signOutLabel}
        />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    color: Colors.neutral,
  },
  headerTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  userCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.displayBal,
    fontSize: 26,
    color: Colors.primary,
  },
  userName: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  userEmail: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  providerBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginTop: Spacing.md,
  },
  providerText: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.primary,
  },
  sectionHeader: {
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.labelCaps,
    color: Colors.outline,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  prefCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  prefInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  prefLabel: {
    ...Typography.headlineMd,
    fontSize: 15,
    color: Colors.onSurface,
  },
  prefDesc: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  infoLabel: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
  },
  infoValue: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  signOutBtn: {
    marginTop: Spacing.lg,
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  signOutLabel: {
    color: Colors.error,
    fontWeight: '700',
  },
});
