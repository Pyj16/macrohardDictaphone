import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, Redirect, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './services/authContext';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import React from "react";
import Recordings from "@/app/recordings";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigation />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
  );
}
function RootNavigation() {
  const { userInfo, loading } = useAuth();
  const pathname = usePathname();

  const isInAuthGroup = pathname.startsWith('/login');
  if (loading) return null;

  if (!userInfo && !isInAuthGroup) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}