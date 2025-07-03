import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authorize} from "react-native-app-auth";

interface AuthContextType {
  userInfo: any;
  jwt: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  loading: boolean;
}

const authConfig = {
  issuer: 'https://login.microsoftonline.com/common',
  clientId: '26914f1a-16e5-4e55-9b8c-e854c070bd41',
  redirectUrl: 'msauth://com.peklar.macrohardDictaphone/u4ofewHWTazty896p0ZBXll4Eas%3D',
  scopes: ['openid', 'profile', 'email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log("context:", context);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async () => {
    // Placeholder for Microsoft Sign-In
    try {
      const result = await authorize(authConfig);
      console.log('Authorization Result:', result);
    } catch (error) {
      console.error('Authorization Error:', error);
    }
    console.log('SignIn called - Replace with Microsoft Auth');
  };

  const signOut = async () => {
    console.log('SignOut called');
    setUserInfo(null);
    setJwt(null);
    await AsyncStorage.removeItem('accessToken');
  };

  const restoreSession = async () => {
    console.log('restoreSession called - No Google sign-in logic');
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      setJwt(token);
      // Optionally: decode or fetch user info here
      setUserInfo({ name: 'Test User', role: 'doctor', email: 'user@example.com' }); // ← dummy data for now
    }
    setLoading(false);
  };
  /*
  useEffect(() => {
    restoreSession();
  }, []);

   */
  return (
      <AuthContext.Provider value={{ userInfo, jwt, signIn, signOut, restoreSession, loading }}>
        {children}
      </AuthContext.Provider>
  );
};
