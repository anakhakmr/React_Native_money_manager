import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useCategories } from '@/contexts/categories-context';

export default function AddCategoryScreen() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<'income' | 'expense'>('income');
  const [name, setName] = useState('');
  const { addCategory, setSelectedType } = useCategories();

  const trimmedName = useMemo(() => name.trim(), [name]);

  const handleAddCategory = () => {
    if (!trimmedName) {
      return;
    }

    addCategory(trimmedName, activeType);
    setSelectedType(activeType);
    setName('');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Category name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Groceries, Salary..."
              placeholderTextColor="#9A93B7"
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, styles.typeLabel]}>Type</Text>
          <View style={styles.segmentRow}>
            <SegmentChip
              label="Expense"
              active={activeType === 'expense'}
              onPress={() => setActiveType('expense')}
              style={styles.segmentChipLeft}
            />
            <SegmentChip
              label="Income"
              active={activeType === 'income'}
              onPress={() => setActiveType('income')}
              style={styles.segmentChipRight}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, !trimmedName ? styles.addButtonDisabled : null]}
          activeOpacity={0.85}
          disabled={!trimmedName}
          onPress={handleAddCategory}>
          <Text style={[styles.addButtonText, !trimmedName ? styles.addButtonTextDisabled : null]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type SegmentChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function SegmentChip({ label, active, onPress, style }: SegmentChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.segmentChip,
        style,
        active
          ? {
              backgroundColor: '#5F4FDB',
              borderColor: '#4C38C4',
            }
          : {
              backgroundColor: '#EFEAFA',
              borderColor: '#E2DDF7',
            },
      ]}>
      <View
        style={[
          styles.radioOuter,
          active ? { borderColor: '#ffffff' } : { borderColor: '#897EBE' },
        ]}>
        {active ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F3FD',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formCard: {
    marginTop: 36,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#2C2350',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 24,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A7696',
  },
  typeLabel: {
    marginTop: 24,
  },
  inputWrapper: {
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E1F5',
    backgroundColor: '#F5F4FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    fontSize: 15,
    color: '#2F2763',
  },
  segmentRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  segmentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
  },
  segmentChipLeft: {
    marginRight: 12,
  },
  segmentChipRight: {
    marginRight: 0,
  },
  segmentLabel: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#7A7696',
  },
  segmentLabelActive: {
    color: '#ffffff',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  addButton: {
    borderRadius: 20,
    backgroundColor: '#6C39C9',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#D9D5F2',
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButtonTextDisabled: {
    color: '#8C85AF',
  },
});
