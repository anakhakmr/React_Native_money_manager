import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CategoryItem, useCategories } from '@/contexts/categories-context';

const TAB_CONFIG = {
  income: {
    label: 'Income',
  },
  expense: {
    label: 'Expense',
  },
} as const;

export default function CategoryScreen() {
  const router = useRouter();
  const { categories, selectedType, setSelectedType, hydrated } = useCategories();

  const filteredCategories = useMemo(
    () => categories.filter(category => category.type === selectedType),
    [categories, selectedType]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Money Manager</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.heading}>Categories</Text>
        <Text style={styles.description}>
          Organize your income and expenses to keep your money on track.
        </Text>

        <SegmentedTabs selected={selectedType} onSelect={setSelectedType} />

        {hydrated ? (
          <FlatList
            data={filteredCategories}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <CategoryCard category={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState type={selectedType} />}
          />
        ) : (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color="#6C39C9" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => router.push('/add-category')}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function SegmentedTabs({
  selected,
  onSelect,
}: {
  selected: 'income' | 'expense';
  onSelect: (type: 'income' | 'expense') => void;
}) {
  return (
    <View style={styles.segmentContainer}>
      {(['income', 'expense'] as const).map(type => {
        const active = selected === type;
        return (
          <TouchableOpacity
            key={type}
            activeOpacity={0.85}
            onPress={() => onSelect(type)}
            style={[styles.segmentButton, active ? styles.segmentButtonActive : null]}>
            <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : null]}>
              {TAB_CONFIG[type].label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CategoryCard({ category }: { category: CategoryItem }) {
  const { removeCategory, setSelectedType } = useCategories();
  const isIncome = category.type === 'income';

  const cardStyles = isIncome ? incomeCardStyles : expenseCardStyles;

  const handleRemove = () => {
    removeCategory(category.id);
    setSelectedType(category.type);
  };

  return (
    <View style={[styles.card, cardStyles.card]}>
      <View style={styles.cardContent}>
        <View style={[styles.cardIconWrapper, cardStyles.iconWrapper]}>
          <Ionicons
            name={isIncome ? 'trending-up' : 'trending-down'}
            size={20}
            color={cardStyles.iconColor}
          />
        </View>
        <View>
          <Text style={[styles.cardTitle, cardStyles.cardTitle]}>{category.name}</Text>
          <Text style={[styles.cardDescription, cardStyles.cardDescription]}>{category.description}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleRemove} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={18} color="#E04848" />
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ type }: { type: 'income' | 'expense' }) {
  const isIncome = type === 'income';
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={isIncome ? 'trending-up' : 'trending-down'}
        size={28}
        color={isIncome ? '#4AA978' : '#D9566F'}
      />
      <Text style={styles.emptyTitle}>
        No {TAB_CONFIG[type].label.toLowerCase()} categories yet
      </Text>
      <Text style={styles.emptySubtitle}>Tap the plus button to add your first one.</Text>
    </View>
  );
}

const incomeCardStyles = {
  card: {
    backgroundColor: '#E6F7EE',
  },
  iconWrapper: {
    backgroundColor: '#CDEBD8',
  },
  iconColor: '#2E9259',
  cardTitle: {
    color: '#1D3D29',
  },
  cardDescription: {
    color: '#3E6B4D',
  },
} as const;

const expenseCardStyles = {
  card: {
    backgroundColor: '#FDE7EF',
  },
  iconWrapper: {
    backgroundColor: '#F6CFDA',
  },
  iconColor: '#D9566F',
  cardTitle: {
    color: '#4F2631',
  },
  cardDescription: {
    color: '#6E3946',
  },
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FF',
  },
  appBar: {
    backgroundColor: '#6C39C9',
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2353',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#7C7792',
    lineHeight: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0D9FF',
    borderRadius: 22,
    padding: 6,
    marginTop: 24,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#47328F',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A6AD8',
  },
  segmentLabelActive: {
    color: '#4C39B8',
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 120,
  },
  loadingWrapper: {
    paddingTop: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#736A9C',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#5D5876',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#39335E',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#6E698C',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7D56F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C0F3D',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
});
