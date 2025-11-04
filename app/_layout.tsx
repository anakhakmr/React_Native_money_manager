import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { CategoriesProvider } from '@/contexts/categories-context';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { TodosProvider } from '@/contexts/todos-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <CategoriesProvider>
      <TransactionsProvider>
        <TodosProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="add-category" options={{ title: 'Add Category' }} />
              <Stack.Screen name="add-transaction" options={{ title: 'Add Transaction' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </TodosProvider>
      </TransactionsProvider>
    </CategoriesProvider>
  );
}
