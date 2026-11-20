import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'demo-user-123',
  email: 'alex.demouser@taskflow.io',
  display_name: 'Alex Mercer',
  avatar_url: '',
  theme: 'light',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Check if demo mode was previously active or if Supabase is not configured
    const savedDemo = localStorage.getItem('taskflow_demo_mode') === 'true';
    if (!isSupabaseConfigured || savedDemo) {
      setIsDemo(true);
      const savedProfile = localStorage.getItem('taskflow_demo_profile');
      setUser(savedProfile ? JSON.parse(savedProfile) : DEMO_USER);
      setLoading(false);
      return;
    }

    // Supabase Auth listener
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signUp = async (email: string, pass: string, name: string) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { display_name: name }
      }
    });
    if (!error && data.user) {
      // Create profile record
      await supabase.from('profiles').insert([
        { id: data.user.id, email, display_name: name, theme: 'light' }
      ]);
    }
    return { error };
  };

  const signOut = async () => {
    if (isDemo) {
      setIsDemo(false);
      localStorage.removeItem('taskflow_demo_mode');
      setUser(null);
      return;
    }
    await supabase?.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const enableDemoMode = () => {
    setIsDemo(true);
    localStorage.setItem('taskflow_demo_mode', 'true');
    localStorage.setItem('taskflow_demo_profile', JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (isDemo) {
      const updated = { ...user, ...updates } as UserProfile;
      setUser(updated);
      localStorage.setItem('taskflow_demo_profile', JSON.stringify(updated));
      return;
    }
    if (!user) return;
    const { error } = await supabase!
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemo,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
