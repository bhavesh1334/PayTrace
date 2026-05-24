import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { usePeople } from '../../hooks/usePeople';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { z } from 'zod';

type Props = NativeStackScreenProps<AppStackParamList, 'AddPerson' | 'EditPerson'>;

// Basic Zod schema for client side validation
const personSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  phone: z.string().optional().refine((val) => !val || /^[0-9+\-\s()]{10,15}$/.test(val), {
    message: 'Invalid phone number format',
  }),
  email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email format',
  }),
});

export default function AddEditPersonScreen({ route, navigation }: Props) {
  const { people, addPerson, updatePerson } = usePeople();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verify if we are editing an existing person
  const personId = route.name === 'EditPerson' ? (route.params as any)?.personId : undefined;
  const isEditMode = !!personId;

  useEffect(() => {
    if (isEditMode && personId) {
      const match = people.find((p) => p.personId === personId);
      if (match) {
        setName(match.name);
        setPhone(match.phone || '');
        setEmail(match.email || '');
      }
    }
  }, [isEditMode, personId, people]);

  const handleSave = async () => {
    setErrors({});
    const validationResult = personSchema.safeParse({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && personId) {
        await updatePerson(personId, name.trim(), phone.trim() || undefined, email.trim() || undefined);
        Alert.alert('Success', 'Contact updated successfully!');
      } else {
        await addPerson(name.trim(), phone.trim() || undefined, email.trim() || undefined);
        Alert.alert('Success', 'Contact created successfully!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save contact');
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
        {/* Navigation header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            accessibilityLabel="Close"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Contact' : 'New Contact'}
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>👤</Text>
            </View>
            <Text style={styles.logoDesc}>
              {isEditMode ? 'Update this profile details' : 'Enter contact information below'}
            </Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Full Name *"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              autoCapitalize="words"
            />

            <InputField
              label="Phone Number (Optional)"
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={errors.phone}
            />

            <InputField
              label="Email Address (Optional)"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
            />
          </View>
        </ScrollView>

        {/* Footer save trigger */}
        <View style={styles.footer}>
          <Button
            label={isEditMode ? 'Update Contact' : 'Create Contact'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </View>
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
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: 20,
    color: Colors.neutral,
  },
  headerTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  headerRightPlaceholder: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoDesc: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceCard,
  },
  saveBtn: {
    width: '100%',
  },
});
