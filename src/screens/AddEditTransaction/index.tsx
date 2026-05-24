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
import { useTransactions } from '../../hooks/useTransactions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { z } from 'zod';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTransaction' | 'EditTransaction'>;

const txSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  note: z.string().max(100, 'Note must be less than 100 characters').optional(),
});

export default function AddEditTransactionScreen({ route, navigation }: Props) {
  const { people } = usePeople();
  // Note: no personId passed here — we don't subscribe to transactions in this modal.
  // Edit-mode data is passed via route.params (pre-populated by PersonDetail).
  const { addTransaction, updateTransaction } = useTransactions();
  
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'lent' | 'borrowed'>('lent');
  const [note, setNote] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Route parameters
  const personIdParam = (route.params as any)?.personId;
  const personNameParam = (route.params as any)?.personName;
  const txIdParam = route.name === 'EditTransaction' ? (route.params as any)?.txId : undefined;
  const isEditMode = !!txIdParam;

  // Effect 1: Set the selected person from route params — runs ONCE on mount.
  // Do NOT include `transactions` here — it changes on every snapshot and causes
  // an infinite re-render loop (max update depth exceeded).
  useEffect(() => {
    if (personIdParam) {
      setSelectedPersonId(personIdParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personIdParam]);

  // Effect 2: Populate edit fields from route params — runs ONCE on mount.
  // EditTransaction passes amount/direction/note directly via route.params
  // so we never need to look them up from the store here.
  useEffect(() => {
    if (isEditMode) {
      const params = route.params as any;
      if (params?.amount !== undefined) {
        setAmount(String(params.amount));
      }
      if (params?.direction) {
        setDirection(params.direction);
      }
      if (params?.note !== undefined) {
        setNote(params.note || '');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setErrors({});
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      setErrors({ amount: 'Enter a valid amount' });
      return;
    }

    if (!selectedPersonId) {
      Alert.alert('Error', 'Please select a contact first.');
      return;
    }

    const validationResult = txSchema.safeParse({
      amount: numAmount,
      note: note.trim() || undefined,
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
      if (isEditMode && txIdParam) {
        await updateTransaction(
          selectedPersonId,
          txIdParam,
          numAmount,
          direction,
          new Date(),
          note.trim() || undefined
        );
        Alert.alert('Success', 'Transaction updated successfully!');
      } else {
        await addTransaction(
          selectedPersonId,
          numAmount,
          direction,
          new Date(),
          note.trim() || undefined
        );
        Alert.alert('Success', 'Transaction recorded successfully!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const currentPerson = people.find((p) => p.personId === selectedPersonId);
  const displayName = currentPerson?.name || personNameParam || 'Select a Contact';

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
            {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Target Profile Card */}
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>WITH CONTACT</Text>
            <Text style={styles.targetName}>{displayName}</Text>
            {currentPerson?.phone && (
              <Text style={styles.targetPhone}>📞 {currentPerson.phone}</Text>
            )}
          </View>

          {/* Lent/Borrowed Direction Switch */}
          <View style={styles.directionContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.directionBtn,
                styles.lentBtn,
                direction === 'lent' && styles.lentActiveBtn,
              ]}
              onPress={() => setDirection('lent')}
            >
              <Text
                style={[
                  styles.directionText,
                  direction === 'lent' && styles.directionActiveText,
                ]}
              >
                Lent (You get)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.directionBtn,
                styles.borrowedBtn,
                direction === 'borrowed' && styles.borrowedActiveBtn,
              ]}
              onPress={() => setDirection('borrowed')}
            >
              <Text
                style={[
                  styles.directionText,
                  direction === 'borrowed' && styles.directionActiveText,
                ]}
              >
                Borrowed (You owe)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.form}>
            <InputField
              label="Transaction Amount (₹) *"
              placeholder="e.g. 500"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(txt) => {
                setAmount(txt);
                setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              error={errors.amount}
              style={styles.amountInput}
            />

            <InputField
              label="Description / Description Note (Optional)"
              placeholder="e.g. Lunch, Movie, Cab fare"
              value={note}
              onChangeText={(txt) => {
                setNote(txt);
                setErrors((prev) => ({ ...prev, note: '' }));
              }}
              error={errors.note}
              autoCapitalize="sentences"
            />
          </View>
        </ScrollView>

        {/* Action Trigger */}
        <View style={styles.footer}>
          <Button
            label={isEditMode ? 'Update Transaction' : 'Record Transaction'}
            onPress={handleSave}
            loading={loading}
            variant={direction === 'lent' ? 'primary' : 'danger'}
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
  targetCard: {
    backgroundColor: Colors.surfaceCard,
    padding: Spacing.lg,
    borderRadius: Radius.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  targetLabel: {
    ...Typography.labelCaps,
    color: Colors.outline,
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  targetName: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  targetPhone: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  directionContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  directionBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceCard,
  },
  directionText: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  lentBtn: {},
  lentActiveBtn: {
    backgroundColor: Colors.successSurface,
    borderColor: Colors.success,
  },
  borrowedBtn: {},
  borrowedActiveBtn: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.danger,
  },
  directionActiveText: {
    color: Colors.onSurface,
  },
  form: {
    width: '100%',
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '600',
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
