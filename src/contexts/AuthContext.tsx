import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Profile = {
  id?: string;
  user_id: string;
  preferred_name: string | null;
  currency?: string;
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
    currency?: string,
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any; profile?: Profile }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGoogleToken: (idToken: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Password strength validator
const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null; // valid
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
      const { data: userRes, error: userError } = await supabase.auth.getUser();
      if (userError || !userRes.user) return;

      const authUser = userRes.user;
      // Get name from Google OAuth if available
      const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.user_metadata?.preferred_name;

      const { data, error } = await sb
        .from('profiles')
        .select('id, user_id, preferred_name, currency, created_at')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; // ignore no rows error

      if (data) {
        // If profile exists but name is null/empty and we have a Google name, update it!
        if (!data.preferred_name && googleName) {
          await sb.from('profiles').update({ preferred_name: googleName }).eq('user_id', authUser.id);
          data.preferred_name = googleName;
        }
        setProfile(data as Profile);
      } else {
        // Profile doesn't exist at all yet - we should insert it with the Google name
        const newProfile = {
          user_id: authUser.id,
          preferred_name: googleName ?? null,
        };

        const { data: insertedData } = await sb.from('profiles').insert([newProfile]).select().single();

        if (insertedData) {
          setProfile(insertedData as Profile);
        } else {
          setProfile({ user_id: authUser.id, preferred_name: googleName ?? null, id: undefined, created_at: null });
        }
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
      // Fallback to auth metadata when table row not yet available
      const { data: userRes } = await supabase.auth.getUser();
      const preferred = (userRes.user?.user_metadata?.full_name || userRes.user?.user_metadata?.name || userRes.user?.user_metadata?.preferred_name) ?? null;
      setProfile({ user_id: user!.id, preferred_name: preferred, id: undefined, created_at: null });
    }
  };

  useEffect(() => {
    // Check if this is a password recovery flow from the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isRecoveryFlow = hashParams.get('type') === 'recovery';

    if (isRecoveryFlow && window.location.pathname !== '/reset-password') {
      // Redirect to reset password page while preserving the hash for Supabase to process
      window.location.href = '/reset-password' + window.location.hash;
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);

        // Handle password recovery - redirect to reset password page
        if (event === 'PASSWORD_RECOVERY' && window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password';
        }
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

  const signUp = async (email: string, password: string, preferredName?: string, currency?: string) => {
    // ✅ Enforce password strength before calling Supabase
    const passwordError = validatePassword(password);
    if (passwordError) return { error: { message: passwordError } };

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          preferred_name: preferredName ?? null,
          currency: currency ?? 'GHS',
        },
      }
    });

    // TRIGGER WELCOME EMAIL if signup was successful
    if (!error && email) {
      // Add user to newsletter_subscribers silently
      supabase.from('newsletter_subscribers').insert([{ email }]).then(({ error: nlError }) => {
        if (nlError && nlError.code !== '23505') { // Ignore unique violation if already subscribed
          console.error("Failed to auto-subscribe new user to newsletter:", nlError);
        }
      });

      // We fire and forget (don't await) so we don't block the UI
      supabase.functions.invoke('send-welcome-email', {
        body: {
          email: email,
          name: preferredName || null
        }
      });
    }
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
    setSession(null);
    setUser(null);
    setProfile(null);
    // Use window.location instead of navigate since AuthProvider is outside Router
    window.location.href = '/';
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    // ✅ Enforce password strength before calling Supabase
    const passwordError = validatePassword(newPassword);
    if (passwordError) return { error: { message: passwordError } };

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/manage`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signInWithGoogleToken = async (idToken: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    profile,
    refreshProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGoogleToken,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
