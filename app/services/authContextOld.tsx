import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userInfo: any;
  jwt: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async () => {
    // Placeholder for Microsoft Sign-In
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
