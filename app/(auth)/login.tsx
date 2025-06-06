// app/login.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  Image,
} from "react-native";
import { useAuth } from "../services/authContext";
import { useRouter } from "expo-router";
import logo from "../../assets/images/logo.png";

export default function LoginScreen() {
  const { signIn, userInfo, loading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  useEffect(() => {
    // If user is already signed in (and role is known), redirect to home
    if (!loading && userInfo?.role) {
      router.replace("/");
    }
  }, [loading, userInfo]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Restoring session…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          { paddingHorizontal: width > 600 ? 80 : 20 },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to MediPhone</Text>
          <Text style={styles.subtitle}>
            Sign in with your Google account to continue
          </Text>

          <TouchableOpacity style={styles.signInButton} onPress={signIn}>
            <Image source={logo} style={styles.googleLogo} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ECEFF1", // light gray
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android elevation
    elevation: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#607D8B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  signInButton: {
    backgroundColor: "#FFFFFF", // keep white so only logo shows
    borderRadius: 4,
    overflow: "hidden",

    // shadow under the Google logo button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleLogo: {
    width: 240,
    height: 48,
    resizeMode: "contain",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#37474F",
  },
});
