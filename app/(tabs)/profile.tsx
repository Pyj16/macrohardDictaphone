import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/authContext.tsx';

export default function LoginScreen() {
  const { signIn, signOut, userInfo } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn();
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <>
          <Text style={styles.heading}>Please Sign In</Text>
          <View style={styles.buttonWrapper}>
            <Button title="Sign in with Google" onPress={handleSignIn} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.welcome}>Welcome, {userInfo.name}</Text>
          {userInfo.photo && (
            <Image
              source={{ uri: userInfo.photo }}
              style={styles.avatar}
            />
          )}
          <Text style={styles.email}>{userInfo.email}</Text>
          <View style={styles.buttonWrapper}>
            <Button title="Log Out" onPress={signOut} color="#d9534f" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ECEFF1',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonWrapper: {
    width: '70%',
    marginTop: 10,
  },
});
