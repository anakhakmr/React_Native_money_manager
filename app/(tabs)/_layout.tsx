import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

const ACTIVE_COLOR = '#5A2DAB';
const INACTIVE_COLOR = '#8F87AE';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = useMemo(
    () => ({
      height: 60 + insets.bottom,
      borderTopWidth: 0,
      paddingHorizontal: 48,
      paddingBottom: Math.max(insets.bottom, 12),
      paddingTop: 10,
      backgroundColor: '#ffffff',
    }),
    [insets.bottom]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: 'Category',
          tabBarIcon: ({ color }) => <Ionicons name="apps-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
