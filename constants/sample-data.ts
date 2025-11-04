export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  date: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description: string;
};

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    title: 'Sales',
    amount: 106,
    type: 'income',
    category: 'Credit',
    note: 'Monthly storefront sales',
    date: '2025-10-30',
  },
  {
    id: 'txn-2',
    title: 'Trip',
    amount: 100,
    type: 'expense',
    category: 'Fuel',
    note: 'Business travel refuel',
    date: '2025-10-31',
  },
  {
    id: 'txn-3',
    title: 'Trip',
    amount: 250,
    type: 'expense',
    category: 'Food',
    note: 'Team offsite meals',
    date: '2025-10-31',
  },
  {
    id: 'txn-4',
    title: 'Sales',
    amount: 500,
    type: 'income',
    category: 'Credit',
    note: 'Weekend pop-up shop',
    date: '2025-11-03',
  },
];
