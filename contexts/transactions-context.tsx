import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Transaction } from '@/constants/sample-data';

export type TransactionItem = Transaction & {
  createdAt: string;
};

type TransactionType = 'income' | 'expense';

type AddTransactionInput = {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
};

type TransactionsContextValue = {
  transactions: TransactionItem[];
  hydrated: boolean;
  addTransaction: (input: AddTransactionInput) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
};

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

const STORAGE_KEY = '@money_manager/transactions';

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setTransactions([]);
          return;
        }

        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) {
          setTransactions([]);
          return;
        }

        const normalized = parsed.filter(isValidTransaction) as TransactionItem[];
        setTransactions(sortTransactions(normalized));
      } catch (error) {
        console.error('Failed to load transactions', error);
        setTransactions([]);
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
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error('Failed to persist transactions', error);
      }
    };

    void persist();
  }, [transactions, hydrated]);

  const addTransaction = useCallback((input: AddTransactionInput) => {
    setTransactions(prev => {
      const transaction: TransactionItem = {
        id: `txn-${Date.now()}`,
        title: input.title.trim(),
        amount: input.amount,
        type: input.type,
        category: input.category,
        note: input.note ?? '',
        date: input.date,
        createdAt: new Date().toISOString(),
      };
      return sortTransactions([transaction, ...prev]);
    });
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      hydrated,
      addTransaction,
      removeTransaction,
      clearTransactions,
    }),
    [transactions, hydrated, addTransaction, removeTransaction, clearTransactions]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}

function isValidTransaction(value: unknown): value is TransactionItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Partial<TransactionItem>;
  return (
    typeof maybe.id === 'string' &&
    typeof maybe.title === 'string' &&
    typeof maybe.amount === 'number' &&
    (maybe.type === 'income' || maybe.type === 'expense') &&
    typeof maybe.category === 'string' &&
    typeof maybe.date === 'string' &&
    typeof maybe.createdAt === 'string' &&
    typeof maybe.note === 'string'
  );
}

function sortTransactions(items: TransactionItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

