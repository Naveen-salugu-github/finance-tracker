import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const GUEST_MODE_KEY = '@finance_guest_mode';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  guestMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  skipRegistration: () => Promise<void>;
  clearGuestMode: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    (async () => {
      const [sessionRes, stored] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(GUEST_MODE_KEY),
      ]);
      setSession(sessionRes.data.session);
      setUser(sessionRes.data.session?.user ?? null);
      setGuestMode(stored === 'true');
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) AsyncStorage.removeItem(GUEST_MODE_KEY).then(() => setGuestMode(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
    setGuestMode(false);
  };

  const skipRegistration = async () => {
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
    setGuestMode(true);
  };

  const clearGuestMode = async () => {
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
    setGuestMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        guestMode,
        signIn,
        signUp,
        signOut,
        skipRegistration,
        clearGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
