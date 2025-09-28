import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Profile = {
  id?: string;
  user_id: string;
  preferred_name: string | null;
  created_at?: string | null;
} | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile;
  refreshProfile: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    preferredName?: string,
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any; profile?: Profile }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(null);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const sb: any = supabase as any;
      const { data, error } = await sb
        .from('profiles')
        .select('id, user_id, preferred_name, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data as Profile);
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const preferred = userRes.user?.user_metadata?.preferred_name ?? null;
        setProfile({ user_id: user.id, preferred_name: preferred, id: undefined, created_at: null });
      }
    } catch (err) {
      // Fallback to auth metadata when table row not yet available
      const { data: userRes } = await supabase.auth.getUser();
      const preferred = userRes.user?.user_metadata?.preferred_name ?? null;
      setProfile({ user_id: user!.id, preferred_name: preferred, id: undefined, created_at: null });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await refreshProfile();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, preferredName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          preferred_name: preferredName ?? null,
        },
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      await refreshProfile();
      const { data: userRes } = await supabase.auth.getUser();
      const fallback: Profile = profile || (userRes.user
        ? { user_id: userRes.user.id, preferred_name: userRes.user.user_metadata?.preferred_name ?? null }
        : null);
      return { error, profile: fallback };
    }
    return { error, profile };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = {
    user,
    session,
    loading,
    profile,
    refreshProfile,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
