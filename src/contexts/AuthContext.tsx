import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, isSignInWithEmailLink, signInWithEmailLink, signOut } from 'firebase/auth';
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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsDummy: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDummy, setIsDummy] = useState(localStorage.getItem('dummyLogin') === 'true');

  useEffect(() => {
    if (isDummy) {
      const dummyUser = { uid: 'dummy-agent-123', email: 'agent@propmart.dummy' } as User;
      const dummyProfile: UserProfile = {
        uid: 'dummy-agent-123',
        email: 'agent@propmart.dummy',
        name: 'Budi Agen (Dummy)',
        phone: '081234567890',
        role: 'agent',
        propertiesSold: 5,
        commissionTier: 2.5,
        createdAt: new Date()
      };
      setUser(dummyUser);
      setProfile(dummyProfile);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // If user exists in Auth but not in Firestore, they might be in the middle of registration
          // We'll handle this in the Register component
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsDummy = async () => {
    localStorage.setItem('dummyLogin', 'true');
    setIsDummy(true);
    try {
      await setDoc(doc(db, 'users', 'dummy-agent-123'), {
        uid: 'dummy-agent-123',
        email: 'agent@propmart.dummy',
        name: 'Budi Agen (Dummy)',
        phone: '081234567890',
        role: 'agent',
        propertiesSold: 5,
        commissionTier: 2.5,
        createdAt: new Date()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to create dummy user in Firestore", e);
    }
  };

  const logout = async () => {
    if (isDummy) {
      localStorage.removeItem('dummyLogin');
      setIsDummy(false);
      setUser(null);
      setProfile(null);
    } else {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, loginAsDummy }}>
      {children}
    </AuthContext.Provider>
  );
};
