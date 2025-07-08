// services/authContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';

export interface AuthContextType {
  id:      string;
  name:    string;
  surname: string;
  email:   string;
  role:    string;
  token:   string;
  setId:      React.Dispatch<React.SetStateAction<string>>;
  setName:    React.Dispatch<React.SetStateAction<string>>;
  setSurname: React.Dispatch<React.SetStateAction<string>>;
  setEmail:   React.Dispatch<React.SetStateAction<string>>;
  setRole:    React.Dispatch<React.SetStateAction<string>>;
  setToken:   React.Dispatch<React.SetStateAction<string>>;
  signOut:    () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [id,      setId]      = useState<string>('');
  const [name,    setName]    = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [email,   setEmail]   = useState<string>('');
  const [role,    setRole]    = useState<string>('');
  const [token,   setToken]   = useState<string>('');

  const signOut = () => {
    setId(''); setName(''); setSurname(''); setEmail(''); setRole(''); setToken('');
  };

  return (
    <AuthContext.Provider
      value={{ id, name, surname, email, role, token,
               setId, setName, setSurname, setEmail, setRole, setToken,
               signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
