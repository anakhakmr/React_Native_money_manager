import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useCategories } from '@/contexts/categories-context';
import { useTransactions } from '@/contexts/transactions-context';

type TransactionType = 'income' | 'expense';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { categories } = useCategories();
  const { transactions, addTransaction, updateTransaction } = useTransactions();

  const existing = id ? (transactions.find(t => t.id === id) ?? null) : null;
  const isEditMode = !!existing;

  const [purpose, setPurpose] = useState(existing?.title ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'income');
  const [categoryId, setCategoryId] = useState<string | null>(() => {
    if (!existing) return null;
    return (
      categories.find(c => c.name === existing.category && c.type === existing.type)?.id ?? null
    );
  });
  const [dateInput, setDateInput] = useState(
    existing ? formatDateInput(new Date(existing.date)) : formatDateInput(new Date())
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter(category => category.type === type),
    [categories, type]
  );

  const selectedCategory = filteredCategories.find(item => item.id === categoryId) ?? null;

  const amountValue = Number(amount);
  const amountIsValid = Number.isFinite(amountValue) && amountValue > 0;
  const purposeIsValid = purpose.trim().length > 0;
  const categoryIsValid = !!selectedCategory;

  const saveDisabled = !(purposeIsValid && amountIsValid && categoryIsValid);

  const handleSelectType = (nextType: TransactionType) => {
    setType(nextType);
    setDropdownOpen(false);
    if (selectedCategory && selectedCategory.type !== nextType) {
      setCategoryId(null);
    }
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setDropdownOpen(false);
  };

  const handleSave = () => {
    if (saveDisabled || !selectedCategory) {
      return;
    }

    const trimmedPurpose = purpose.trim();
    const parsedDate = new Date(dateInput);
    const isoDate = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : new Date(parsedDate.setHours(0, 0, 0, 0)).toISOString();

    if (isEditMode && existing) {
      updateTransaction({
        id: existing.id,
        title: trimmedPurpose,
        amount: amountValue,
        type,
        category: selectedCategory.name,
        date: isoDate,
        note: note.trim(),
      });
    } else {
      addTransaction({
        title: trimmedPurpose,
        amount: amountValue,
        type,
        category: selectedCategory.name,
        date: isoDate,
        note: note.trim(),
      });
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: isEditMode ? 'Edit Transaction' : 'Add Transaction' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#2F2763" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</Text>
        <Text style={styles.subtitle}>
          {isEditMode ? 'Update the details below.' : 'Fill the details below to record a new transaction.'}
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Transaction details</Text>

          <LabeledInput
            label="Purpose"
            placeholder="Explain what this transaction is for"
            icon="create-outline"
            value={purpose}
            onChangeText={setPurpose}
          />

          <LabeledInput
            label="Amount"
            placeholder="Amount in INR"
            icon="cash-outline"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.fieldLabel}>Transaction type</Text>
          <View style={styles.toggleRow}>
            <ToggleChip
              label="Income"
              icon="arrow-up-outline"
              active={type === 'income'}
             // tint="#2E9D63"
              onPress={() => handleSelectType('income')}
              style={styles.toggleChipLeft}
            />
            <ToggleChip
              label="Expense"
              icon="arrow-down-outline"
              active={type === 'expense'}
//tint="#E04848"
              onPress={() => handleSelectType('expense')}
              style={styles.toggleChipRight}
            />
          </View>

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.dropdown}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(prev => !prev)}
              disabled={filteredCategories.length === 0}>
              <Text
                style={[
                  styles.dropdownValue,
                  !selectedCategory ? styles.dropdownPlaceholder : null,
                  filteredCategories.length === 0 ? styles.dropdownDisabled : null,
                ]}>
                {filteredCategories.length === 0
                  ? 'No categories available'
                  : selectedCategory?.name ?? 'Select category'}
              </Text>
              <Ionicons
                name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#777CA0"
              />
            </TouchableOpacity>
            {dropdownOpen && filteredCategories.length > 0 ? (
              <View style={styles.dropdownList}>
                {filteredCategories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.dropdownItem,
                      category.id === categoryId ? styles.dropdownItemActive : null,
                    ]}
                    onPress={() => handleSelectCategory(category.id)}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        category.id === categoryId ? styles.dropdownItemTextActive : null,
                      ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={18} color="#7C7FAA" />
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A6AAC8"
              style={styles.input}
              value={dateInput}
              onChangeText={setDateInput}
            />
          </View>

          <LabeledInput
            label="Notes"
            placeholder="Optional details"
            icon="document-text-outline"
            value={note}
            onChangeText={setNote}
          />
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, saveDisabled ? styles.saveButtonDisabled : null]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saveDisabled}>
          <Ionicons name="save-outline" size={18} color={saveDisabled ? '#C7C3EB' : '#ffffff'} />
          <Text style={[styles.actionText, styles.saveText, saveDisabled ? styles.saveTextDisabled : null]}>
            {isEditMode ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type LabeledInputProps = {
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'numeric' | 'default';
};

function LabeledInput({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  keyboardType = 'default',
}: LabeledInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={18} color="#7C7FAA" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#A6AAC8"
          style={styles.input}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

function ToggleChip({
  label,
  icon,
  active = false,
  onPress,
  style,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = active
    ? {
        border: '#7054FF',
        background: '#F0EBFF',
        tint: '#5B3FE3',
        text: '#4430A8',
      }
    : {
        border: '#E0E1F3',
        background: '#F3F3FD',
        tint: '#7C7FAA',
        text: '#7C7FAA',
      };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.toggleChip,
        {
          borderColor: colors.border,
          backgroundColor: colors.background,
        },
        style,
      ]}
      onPress={onPress}>
      <Ionicons name={icon} size={16} color={colors.tint} />
      <Text style={[styles.toggleText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F3FD',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 10,
    height: 42,
    width: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEBFA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F2763',
    marginTop: 6,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#807C99',
  },
  sectionCard: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#2C2350',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 24,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#352D6A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A7696',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E1F5',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#2F2763',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  toggleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleChipLeft: {
    marginRight: 12,
  },
  toggleChipRight: {
    marginRight: 0,
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F4FE',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E1F5',
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F2763',
  },
  dropdownPlaceholder: {
    color: '#8C8AA9',
  },
  dropdownDisabled: {
    color: '#B3B0C9',
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E1F5',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: '#ECE8FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#4A3D7A',
  },
  dropdownItemTextActive: {
    color: '#4C39B8',
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: '#F4F3FD',
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#6E63D5',
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#6350F2',
    marginLeft: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#E0DCFB',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#6E63D5',
  },
  saveText: {
    color: '#ffffff',
    marginLeft: 8,
  },
  saveTextDisabled: {
    color: '#B5B2D4',
  },
});
