import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
    phone: string | null;
    user_metadata: {
        preferred_name: string | null;
    };
}

export function useUsers() {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Call the Edge Function to get auth users
            const { data, error: fnError } = await supabase.functions.invoke('get-auth-users');

            if (fnError) throw fnError;

            if (data?.users) {
                setUsers(data.users);
            } else {
                throw new Error('No users data returned');
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to fetch users');

            // Fallback to profiles table if Edge Function fails
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!profileError && profileData) {
                    // Map profiles to AuthUser format
                    const mappedUsers: AuthUser[] = profileData.map((p: any) => ({
                        id: p.user_id || p.id,
                        email: '', // Not available in profiles
                        created_at: p.created_at,
                        last_sign_in_at: null,
                        email_confirmed_at: null,
                        phone: null,
                        user_metadata: {
                            preferred_name: p.preferred_name
                        }
                    }));
                    setUsers(mappedUsers);
                    setError('Using fallback data (profiles table)');
                }
            } catch (fallbackErr) {
                console.error('Fallback also failed:', fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, refreshUsers: fetchUsers };
}

