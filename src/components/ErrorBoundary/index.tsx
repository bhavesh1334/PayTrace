import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { Button } from '../Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. You can attempt to reload the interface or contact support.
            </Text>
            {this.state.error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText} numberOfLines={6}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
            <Button
              label="Reload Application"
              onPress={this.handleReset}
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
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
  errorCard: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.DEFAULT,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  errorText: {
    ...Typography.bodySm,
    color: Colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  button: {
    width: '100%',
  },
});
