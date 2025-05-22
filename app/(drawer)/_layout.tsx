import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <IconSymbol name="house.fill" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="statistics"
        options={{
          title: 'Stats',
          drawerIcon: ({ color, size }) => (
            <IconSymbol name="chart.bar.fill" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="debug"
        options={{
          title: 'Debug',
          drawerIcon: ({ color, size }) => (
            <IconSymbol name="paperplane.fill" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <IconSymbol name="person.fill" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}
