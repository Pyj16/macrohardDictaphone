import React, { createContext, useContext, useState, useEffect} from 'react';
import { GoogleSignin, statusCodes,GoogleSigninButton, } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

GoogleSignin.configure({
  webClientId: '461690677221-m30b4qeutola3j0od96acbd2n3o2u50s.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '461690677221-iiubqglurpquo77jp35cir0q47lcat4p.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

let isRestoring = false;

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

const isJwtExpired = (token: string): boolean => {
    try {
      const { exp } = jwt_decode<any>(token);
      return Date.now() / 1000 > exp;
    } catch (e) {
      return true; // Ce je expired
    }
  };

  const signIn = async () => {
    try {
      console.log("Checking for Play Services...");
      await GoogleSignin.hasPlayServices();

      console.log("Attempting Google Sign-In...");
      const response = await GoogleSignin.signIn();

      console.log(idToken)
    const user = await GoogleSignin.signInSilently();
    const { idToken } = await GoogleSignin.getTokens(); // Baje chill


      if (!idToken || !user) {
        throw new Error('Missing idToken or user info');
      }

      const res = await fetch('http://192.168.64.30:5000/verify-token', { // Replace with your ip
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (res.status !== 200) throw new Error(data.error || 'Verification failed');

      const token = data.jwt;
      await AsyncStorage.setItem('accessToken', token);

      setUserInfo({
          name: data.name,
          photo: user.photo,
          role: data.role,
          email: data.email,
      });

      setJwt(token);

      console.log("JWT Token Data: ",data.jwt)
      console.log("Login successful");
      console.log("User role is:", data.role);

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Sign-In cancelled by user");
      } else {
        console.error("Google Sign-In Error:", error.message || error);
      }
    }
  };
  const restoreSession = async () => {
    if (isRestoring) {
      console.log("restoreSession already in progress");
      return;
    }

    isRestoring = true;

    try {
      console.log('Attempting silent sign-in...');
      const currentUser = await GoogleSignin.getCurrentUser();

      if (!currentUser) {
        console.log('No user signed in');
        return;
      }

      const user = await GoogleSignin.signInSilently();
      const { idToken } = await GoogleSignin.getTokens();
      console.log("Token: ",idToken)


      const res = await fetch('http://192.168.64.30:5000/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.status === 200) {
        const token = data.jwt;
        await AsyncStorage.setItem('accessToken', token);
        setUserInfo({
          name: data.name,
          photo: user.photo,
          role: data.role,
          email: data.email,
        });
        setJwt(token);
        console.log('Auto-login restored');
      } else {
        console.warn('Auto-login failed:', data.error);
        await GoogleSignin.signOut();
        await AsyncStorage.removeItem('accessToken');
      }

    } catch (error) {
      console.error('Silent login error:', error);
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('accessToken');
    } finally {
      isRestoring = false;
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null);
      setJwt(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };
useEffect(() => {
  (async () => {
    console.log("Attempting auto-login...");
    await restoreSession();
    setLoading(false);
  })();
}, []);
  return (
    <AuthContext.Provider value={{ userInfo, jwt, signIn, signOut, restoreSession, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

