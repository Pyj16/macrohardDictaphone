// app/login.tsx

import React from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/authContext';

export default function LoginScreen() {
  const { signIn, signOut, userInfo } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn();
    // Optionally, redirect to home after sign-in:
    // router.replace('/');
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.card}>
          {!userInfo ? (
            <>
              <Text style={styles.heading}>Welcome Back</Text>
              <Text style={styles.subtext}>
                Please sign in with your Google account to continue.
              </Text>

              <View style={styles.buttonWrapper}>
                <Button title="Sign in with Google" onPress={handleSignIn} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Hello, {userInfo.name}!</Text>
              {userInfo.photo && (
                <Image source={{ uri: userInfo.photo }} style={styles.avatar} />
              )}
              <Text style={styles.email}>{userInfo.email}</Text>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Log Out"
                  onPress={signOut}
                  color={Platform.OS === 'ios' ? '#ff3b30' : '#d9534f'}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Android shadow
    elevation: 4,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#37474F',
  },
  subtext: {
    fontSize: 16,
    color: '#607D8B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#CFD8DC',
  },
  email: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 8,
  },
});
