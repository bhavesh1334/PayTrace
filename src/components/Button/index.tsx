import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  ...rest
}) => {
  const isInteractionDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: styles.secondaryButton,
          label: styles.secondaryLabel,
        };
      case 'danger':
        return {
          button: styles.dangerButton,
          label: styles.dangerLabel,
        };
      case 'outline':
        return {
          button: styles.outlineButton,
          label: styles.outlineLabel,
        };
      case 'primary':
      default:
        return {
          button: styles.primaryButton,
          label: styles.primaryLabel,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isInteractionDisabled}
      style={[
        styles.button,
        variantStyles.button,
        disabled && styles.disabledButton,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Colors.primary : Colors.onPrimary}
        />
      ) : (
        <Text style={[styles.label, variantStyles.label, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radius.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryLabel: {
    color: Colors.onPrimary,
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceContainer,
  },
  secondaryLabel: {
    color: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
  },
  dangerLabel: {
    color: Colors.onPrimary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  outlineLabel: {
    color: Colors.onSurface,
  },
  disabledButton: {
    opacity: 0.5,
  },
  label: {
    ...Typography.headlineMd,
    fontSize: 16,
    textAlign: 'center',
  },
});
