import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ProfileInput = {
  preferred_name?: string | null;
};

export const useProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      if (!user) {
        return { error: 'User not authenticated' };
      }

      setUpdating(true);
      try {
        const payload = {
          user_id: user.id,
          preferred_name: input.preferred_name ?? null,
        };

        // Try to persist to profiles table (if present)
        const sb: any = supabase as any;
        const { error: upsertError } = await sb
          .from('profiles')
          .upsert(payload, { onConflict: 'user_id' });

        // Always also update auth metadata to ensure persistence across sessions
        const { error: metaError } = await supabase.auth.updateUser({
          data: { preferred_name: input.preferred_name ?? null },
        });

        if (upsertError && !metaError) {
          // Table may not exist or RLS may block; metadata update still ensures greeting works
        } else if (upsertError && metaError) {
          throw upsertError || metaError;
        }

        await refreshProfile();
        toast({ title: 'Profile updated', description: 'Your profile information has been saved.' });
        return { error: null };
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Profile update failed', description: error.message });
        return { error };
      } finally {
        setUpdating(false);
      }
    },
    [user, refreshProfile, toast]
  );

  return {
    profile,
    updating,
    updateProfile,
    getProfile: async () => {
      await refreshProfile();
      return profile;
    },
  };
};
