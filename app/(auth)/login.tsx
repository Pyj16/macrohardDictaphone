import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../services/authContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { signIn, userInfo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userInfo?.role === 'doctor') {
      router.replace('/');
    } else if (userInfo?.role === 'personel') {
      router.replace('/');
    }
  }, [userInfo]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Please sign in</Text>
      <Button title="Sign in with Google" onPress={signIn} />
    </View>
  );
}
