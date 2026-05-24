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
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signInWithEmail, signInWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
      // Success will automatically trigger AuthState change and navigation via RootNavigator
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      // Ignore if user cancelled
      if (err.message && !err.message.includes('developer error') && !err.message.includes('SIGN_IN_CANCELLED')) {
        setError(err.message || 'Google Sign-In failed');
      }
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
            <Text style={styles.logo}>💸</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to manage your outstanding balances</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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

            <InputField
              label="Password"
              placeholder="Enter your password"
              isPassword
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              label="Log In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginBtn}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              label="Sign in with Google"
              variant="outline"
              onPress={handleGoogleSignIn}
              style={styles.googleBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
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
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.md,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotText: {
    color: Colors.primary,
    ...Typography.bodySm,
    fontWeight: '600',
  },
  loginBtn: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  dividerText: {
    ...Typography.bodySm,
    color: Colors.outline,
    marginHorizontal: Spacing.md,
  },
  googleBtn: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  footerLink: {
    ...Typography.bodySm,
    color: Colors.primary,
    fontWeight: '700',
  },
});
