import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await sendPasswordReset(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.logo}>🔑</Text>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you instructions to reset it
            </Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Check your inbox!</Text>
                <Text style={styles.successText}>
                  We sent password reset instructions to {email}. Follow the instructions to choose a new password.
                </Text>
                <Button
                  label="Back to Login"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.backToLoginBtn}
                />
              </View>
            ) : (
              <>
                <InputField
                  label="Email Address"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                />

                <Button
                  label="Send Reset Instructions"
                  onPress={handleReset}
                  loading={loading}
                  style={styles.actionBtn}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.neutral,
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.md,
    marginTop: 20,
  },
  title: {
    ...Typography.headlineLg,
    fontSize: 24,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.DEFAULT,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySm,
    color: Colors.error,
    fontWeight: '600',
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: Colors.successSurface,
    borderRadius: Radius.DEFAULT,
    padding: Spacing.xl,
  },
  successTitle: {
    ...Typography.headlineMd,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.bodySm,
    color: Colors.success,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  backToLoginBtn: {
    width: '100%',
    backgroundColor: Colors.success,
  },
  actionBtn: {
    width: '100%',
    marginTop: Spacing.md,
  },
});
