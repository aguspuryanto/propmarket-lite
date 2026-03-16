import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  propertiesSold?: number;
  commissionTier?: number;
  createdAt: Date;
}

// Mock User object to match the expected interface in other components
interface MockUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsDummy: (role: 'agent' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  loginAsDummy: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLocalAuth = async () => {
      const storedRole = localStorage.getItem('dummyLoginRole');
      if (storedRole === 'agent' || storedRole === 'admin') {
        await loginAsDummy(storedRole);
      } else {
        setLoading(false);
      }
    };
    checkLocalAuth();
  }, []);

  const loginAsDummy = async (role: 'agent' | 'admin') => {
    setLoading(true);
    localStorage.setItem('dummyLoginRole', role);
    
    const uid = role === 'agent' ? 'dummy-agent-123' : 'dummy-admin-123';
    const email = role === 'agent' ? 'agent@propmart.dummy' : 'admin@propmart.dummy';
    const name = role === 'agent' ? 'Budi Agen (Dummy)' : 'Siti Admin (Dummy)';
    
    const dummyUser: MockUser = { uid, email };
    const dummyProfile: UserProfile = {
      uid,
      email,
      name,
      phone: '081234567890',
      role,
      propertiesSold: role === 'agent' ? 5 : 0,
      commissionTier: role === 'agent' ? 2.5 : 0,
      createdAt: new Date()
    };

    setUser(dummyUser);
    setProfile(dummyProfile);

    try {
      // Ensure the dummy user exists in Firestore so other queries work
      await setDoc(doc(db, 'users', uid), dummyProfile, { merge: true });
    } catch (e) {
      console.error("Failed to sync dummy user to Firestore", e);
    }
    
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('dummyLoginRole');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, loginAsDummy }}>
      {children}
    </AuthContext.Provider>
  );
};
