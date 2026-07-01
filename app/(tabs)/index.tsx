import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { TransactionItem, useTransactions } from '@/contexts/transactions-context';

const AMOUNT_COLOR = {
  income: '#2E9D63',
  expense: '#E04848',
} as const;

const TYPE_BADGE = {
  income: {
    backgroundColor: '#E3F8EC',
    textColor: '#2E9D63',
    icon: 'arrow-up-outline' as const,
    label: 'Income',
  },
  expense: {
    backgroundColor: '#FCE6E6',
    textColor: '#E04848',
    icon: 'arrow-down-outline' as const,
    label: 'Expense',
  },
};

const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, hydrated } = useTransactions();

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.type === 'income') {
          acc.income += item.amount;
        } else {
          acc.expense += item.amount;
        }
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  const hasTransactions = transactions.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appBar}>
        <View style={styles.appBarContent}>
          <Text style={styles.appTitle}>Money Manager</Text>
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="pie-chart" size={20} color="#ffffff" />
            <Text style={styles.summaryTitle}>Account Summary</Text>
          </View>
          <View style={styles.summaryValuesRow}>
            <SummaryValue title="Credits" amount={summary.income} tint="#44D3F6" />
            <SummaryValue title="Expense" amount={summary.expense} tint="#FF6F91" />
            <SummaryValue title="Balance" amount={summary.balance} tint="#5AED8B" />
          </View>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        {hydrated ? (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.listContent, !hasTransactions && styles.listEmptyContent]}
            renderItem={({ item }) => <TransactionCard transaction={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<TransactionEmptyState />}
          />
        ) : (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color="#6C39C9" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.fab} onPress={() => router.push('/add-transaction')}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function TransactionCard({ transaction }: { transaction: TransactionItem }) {
  const router = useRouter();
  const { removeTransaction } = useTransactions();

  const handleEdit = () => {
    router.push({ pathname: '/add-transaction', params: { id: transaction.id } });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(transaction.id) },
      ]
    );
  };

  const date = new Date(transaction.date);
  const day = date.getDate().toString().padStart(2, '0');
  const monthShort = MONTHS_SHORT[date.getMonth()];
  const weekday = WEEKDAYS_LONG[date.getDay()];
  const monthLong = MONTHS_LONG[date.getMonth()];
  const formattedDate = `${weekday}, ${day} ${monthLong} ${date.getFullYear()}`;

  const typeBadge = TYPE_BADGE[transaction.type];

  return (
    <View style={styles.transactionCard}>
      <View style={styles.datePill}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{monthShort}</Text>
      </View>

      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={[styles.transactionAmount, { color: AMOUNT_COLOR[transaction.type] }]}>
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.typeTag, { backgroundColor: typeBadge.backgroundColor }]}>
            <Ionicons
              name={typeBadge.icon}
              size={14}
              color={typeBadge.textColor}
              style={styles.typeTagIcon}
            />
            <Text style={[styles.typeTagText, { color: typeBadge.textColor }]}>{typeBadge.label}</Text>
          </View>
          <View style={styles.notePill}>
            <Text style={styles.noteText}>{transaction.category}</Text>
          </View>
        </View>

        {transaction.note ? <Text style={styles.transactionNote}>{transaction.note}</Text> : null}
        <Text style={styles.transactionDate}>{formattedDate}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={handleEdit}>
          <Ionicons name="pencil" size={16} color="#9AA0B4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color="#E04848" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryValue({ title, amount, tint }: { title: string; amount: number; tint: string }) {
  return (
    <View style={styles.summaryValueCard}>
      <Text style={styles.summaryValueLabel}>{title}</Text>
      <Text style={[styles.summaryValueAmount, { color: tint }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

function TransactionEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={32} color="#B0B3CC" />
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptySubtitle}>Tap the plus button to record your first one.</Text>
    </View>
  );
}

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const formatted = amount.toFixed(2);
    return `₹${formatted}`;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F5FB',
  },
  appBar: {
    backgroundColor: '#6C39C9',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
  },
  summaryCard: {
    backgroundColor: '#4C1F99',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#130826',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#F0E5FF',
  },
  summaryValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  summaryValueCard: {
    flex: 1,
  },
  summaryValueLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#D9C6FF',
    textTransform: 'uppercase',
  },
  summaryValueAmount: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  listEmptyContent: {
    flexGrow: 1,
  },
  loadingWrapper: {
    paddingTop: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6C678F',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#120B28',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 4,
  },
  datePill: {
    width: 62,
    borderRadius: 16,
    backgroundColor: '#F0F1F6',
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 16,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4D5770',
  },
  dateMonth: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#8A92A6',
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2C42',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeTagIcon: {
    marginRight: 6,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F1F6',
    marginLeft: 10,
  },
  noteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B647A',
  },
  transactionNote: {
    marginTop: 10,
    fontSize: 13,
    color: '#7B8398',
  },
  transactionDate: {
    marginTop: 6,
    fontSize: 12,
    color: '#A1A7BA',
  },
  cardActions: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: '600',
    color: '#3D3A58',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#757493',
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
