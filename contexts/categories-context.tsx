import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Category } from '@/constants/sample-data';

export type CategoryItem = Category & {
  createdAt: string;
};

type CategoryType = 'income' | 'expense';

type CategoriesContextValue = {
  categories: CategoryItem[];
  selectedType: CategoryType;
  hydrated: boolean;
  addCategory: (name: string, type: CategoryType) => void;
  removeCategory: (id: string) => void;
  setSelectedType: (type: CategoryType) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

const DEFAULT_DESCRIPTION: Record<CategoryType, string> = {
  income: 'Keep an eye on your earnings',
  expense: 'Great for tracking your spendings',
};

const STORAGE_KEY = '@money_manager/categories';

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedType, setSelectedType] = useState<CategoryType>('income');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setCategories([]);
          return;
        }

        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) {
          setCategories([]);
          return;
        }

        const normalized = parsed.filter(isValidCategory) as CategoryItem[];
        setCategories(normalized);
      } catch (error) {
        console.error('Failed to load categories', error);
        setCategories([]);
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      } catch (error) {
        console.error('Failed to persist categories', error);
      }
    };

    void persist();
  }, [categories, hydrated]);

  const addCategory = useCallback((name: string, type: CategoryType) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setCategories(prev => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: trimmed,
        type,
        description: DEFAULT_DESCRIPTION[type],
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      categories,
      selectedType,
      hydrated,
      addCategory,
      removeCategory,
      setSelectedType,
    }),
    [categories, selectedType, hydrated, addCategory, removeCategory]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}

function isValidCategory(value: unknown): value is CategoryItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Partial<CategoryItem>;
  return (
    typeof maybe.id === 'string' &&
    typeof maybe.name === 'string' &&
    (maybe.type === 'income' || maybe.type === 'expense') &&
    typeof maybe.description === 'string' &&
    typeof maybe.createdAt === 'string'
  );
}
