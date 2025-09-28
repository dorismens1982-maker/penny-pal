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

        const sb: any = supabase as any;
        const { error } = await sb
          .from('profiles')
          .upsert(payload, { onConflict: 'user_id' });

        if (error) throw error;

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
