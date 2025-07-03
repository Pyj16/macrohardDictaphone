// app/_layout.tsx
import React, {useEffect, useState} from "react";
import { usePathname, Redirect, Slot, useRouter } from "expo-router";
// import { role } from authContext<

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./services/authContext";
import "react-native-reanimated";

// import { useColorScheme } from "@/hooks/useColorScheme";

function RootNavigation() {
  const router = useRouter();
  const { userInfo, loading } = useAuth();
  const pathname = usePathname().toLowerCase();

  useEffect(() => {
    console.log("Home Screen");
  }, []);

//   if (loading) {
//     console.log('loading');
//     return null;
//   }

  const isOnLogin = pathname.startsWith("/login");
  if (!userInfo && !isOnLogin) {
    console.log('going to login');
    return <Redirect href="/login" />;
  }


  if (userInfo && userInfo.role !== "personel" && pathname.startsWith("/(tabs)/(administrator)")) {
    console.log('going to admin');
    return <Redirect href="/" />;
  }
  if (
    userInfo &&
    userInfo.role === "personel" &&
    pathname.startsWith("/index")
  ) {
    console.log('going to admin');
    return <Redirect href="/(tabs)/(administrator)" />;
  }
  if (
    userInfo &&
    userInfo.role === "personel" &&
    pathname.startsWith("/statistics")
  ) {
    console.log('going to admin');
    return <Redirect href="/(tabs)/(administrator)" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
  );
}

import { useColorScheme } from 'react-native';


// function RootNavigation() {
//   const router = useRouter();
//   const scheme = useColorScheme();
//
//   const [isReady, setIsReady] = useState(false);
//
//   // Wait until layout has mounted
//   useEffect(() => {
//     setTimeout(() => {
//       setIsReady(true);
//     }, 0);
//   }, []);
//
//   useEffect(() => {
//     if (isReady) {
//       //1if (role === 'doctor'){
//       if (isReady)
//         router.replace('/(tabs)/(doctor)');
//     }
//   }, [isReady]);
//
//   return <Slot />;
// }
