import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useAuth } from '../services/authContext';
import { useRouter } from 'expo-router';
import logo from '../../assets/images/logo.png';

export default function LoginScreen() {
  const { signIn, userInfo, loading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

useEffect(() => {
  if (!loading && userInfo?.role) {
    console.log("Redirecting user with role:", userInfo.role); // To deletni potem
    router.replace('/');
    console.log("userInfo:", userInfo, "loading:", loading);// To deletni potem

  }
}, [loading, userInfo]);
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Restoring session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingHorizontal: width > 600 ? 80 : 20 }]}>
        <Text style={styles.title}>Welcome to MediPhone</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        <TouchableOpacity style={styles.signInButton} onPress={signIn}>
          <Image source={logo} style={styles.googleLogo} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  googleLogo: {
    width: 240,
    height: 48,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});
