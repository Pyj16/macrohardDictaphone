import React from 'react';
import { View, Text, Button, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/authContext.tsx';

export default function LoginScreen() {
  const { signIn, signOut, userInfo } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!userInfo ? (
        <>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>Please sign in</Text>
          <Button title="Sign in with Google" onPress={handleSignIn} />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Welcome, {userInfo?.name}</Text>
          {userInfo?.photo && (
            <Image
              source={{ uri: userInfo?.photo }}
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
            />
          )}
          <Text style={{ marginBottom: 20 }}>{userInfo.email}</Text>
          <Button title="Log Out" onPress={signOut} />
        </>
      )}
    </View>
  );
}
