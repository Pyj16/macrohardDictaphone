import React, { useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Image
} from 'react-native';
import { useAuth } from '../services/authContext';
import { useRouter } from 'expo-router';
import logo from '../../assets/images/logo.png'

export default function LoginScreen() {
    const { signIn, userInfo } = useAuth();
    const router = useRouter();
    const { width } = useWindowDimensions();

  useEffect(() => {
    if (userInfo?.role === 'doctor') {
      router.replace('/');
    } else if (userInfo?.role === 'personel') {
      router.replace('/');
    }
  }, [userInfo]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingHorizontal: width > 600 ? 80 : 20 }]}>
        <Text style={styles.title}>Welcome to MediPhone</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        <TouchableOpacity style={styles.signInButton} onPress={signIn}>
            <Image
                source={logo}
                style={styles.googleLogo}
            />
          <Text style={styles.signInText}>
          </Text>
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

});