import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const secureEntry = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          !!error && styles.errorInputContainer,
        ]}
      >
        <TextInput
          placeholderTextColor={Colors.outline}
          secureTextEntry={secureEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, isPassword && styles.passwordInput]}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.visibilityToggle}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.visibilityText}>
              {showPassword ? '👁️' : '🔒'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  label: {
    ...Typography.bodySm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.DEFAULT,
    backgroundColor: Colors.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  focusedInputContainer: {
    borderColor: Colors.primary,
  },
  errorInputContainer: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.onSurface,
    ...Typography.bodyLg,
    padding: 0, // Reset default padding
  },
  passwordInput: {
    paddingRight: Spacing.md,
  },
  visibilityToggle: {
    padding: Spacing.xs,
  },
  visibilityText: {
    fontSize: 16,
  },
  errorText: {
    ...Typography.bodySm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
