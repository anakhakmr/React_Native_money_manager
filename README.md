# Money Manager

A personal finance tracking mobile app built with React Native and Expo. Record your income and expenses, organize them by category, and keep an eye on your account balance — all stored locally on your device.

## Features

- **Transaction tracking** — Add income and expense entries with a title, amount, category, date, and optional note
- **Account summary** — Dashboard card showing total credits, total expenses, and net balance
- **Category management** — Create and delete custom categories for both income and expenses
- **Offline-first** — All data is persisted locally using AsyncStorage; no account or internet connection required
- **INR currency** — Amounts are formatted in Indian Rupees (₹)

## Screens

| Screen | Description |
| --- | --- |
| Transactions | Main dashboard with account summary and a date-sorted transaction list |
| Categories | Segmented view to browse, add, and delete income/expense categories |
| Add Transaction | Form to record a new transaction (title, amount, type, category, date, notes) |
| Add Category | Form to create a new category with a name and type |

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Transactions screen
    category.tsx       # Categories screen
    _layout.tsx        # Tab navigator layout
  add-transaction.tsx  # Add transaction screen
  add-category.tsx     # Add category screen
  _layout.tsx          # Root layout with context providers

contexts/
  transactions-context.tsx  # Transaction state + AsyncStorage persistence
  categories-context.tsx    # Category state + AsyncStorage persistence

constants/
  sample-data.ts       # Shared TypeScript types (Transaction, Category)
  theme.ts             # Theme constants

components/            # Shared UI components
hooks/                 # Custom hooks (color scheme, theme color)
```

## Tech Stack

- [Expo SDK 54](https://expo.dev) with [Expo Router v6](https://docs.expo.dev/router/introduction/) for file-based navigation
- React 19 + TypeScript
- React Context API for global state management
- [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) for local persistence
- [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons) for icons

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator, Android Emulator, or the [Expo Go](https://expo.dev/go) app on your device

### Installation

```bash
npm install
```

### Running the app

```bash
# Start the Expo dev server
npx expo start
```

Then press:
- `i` to open in iOS Simulator
- `a` to open in Android Emulator
- Scan the QR code with Expo Go on your device

## Architecture Notes

- Both `TransactionsContext` and `CategoriesContext` follow the same pattern: hydrate from AsyncStorage on mount, then auto-persist to storage on every state change.
- Data validation runs on hydration to guard against corrupt or malformed stored data.
- Transactions are sorted by date descending (newest first), with `createdAt` as a tiebreaker.
- There is no cloud sync, authentication, or analytics — the app is entirely local.
