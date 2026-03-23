import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subscriber {
    id: string;
    email: string;
    status: 'subscribed' | 'unsubscribed';
    subscribed_at: string;
}

export const useSubscribers = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await (supabase as any)
                .from('newsletter_subscribers')
                .select('id, email, status, subscribed_at')
                .order('subscribed_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching subscribers:', fetchError);
                throw fetchError;
            }

            setSubscribers(data || []);
        } catch (err: any) {
            console.error('Failed to load subscribers:', err);
            setError(err.message || 'Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    // Note: Realtime subscription removed to reduce egress.
    // Use the refresh() function or a manual refetch button in the admin UI instead.

    return { subscribers, loading, error, refresh: fetchSubscribers };
};
