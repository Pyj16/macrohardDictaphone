// app/_layout.tsx

import React from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { usePathname, Redirect, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./services/authContext";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigation() {
  const { userInfo, loading } = useAuth();
  const pathname = usePathname().toLowerCase();

  if (loading) {
    return null;
  }

  const isOnLogin = pathname.startsWith("/login");
  if (!userInfo && !isOnLogin) {
    return <Redirect href="/login" />;
  }

  if (userInfo && userInfo.role !== "personel" && pathname.startsWith("/personel")) {
    return <Redirect href="/" />;
  }
  if (
    userInfo &&
    userInfo.role === "personel" &&
    pathname.startsWith("/index")
  ) {
    return <Redirect href="/personel" />;
  }

  if (
    userInfo &&
    userInfo.role === "personel" &&
    pathname.startsWith("/statistics")
  ) {
    return <Redirect href="/personel" />;
  }

  return <Slot />;
}
