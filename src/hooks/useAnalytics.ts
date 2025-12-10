import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subMonths, format, parseISO } from 'date-fns';

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number; // For now, this might just be total users or users with recent login if tracked
    totalPosts: number;
    userGrowth: { date: string; count: number }[];
    recentActivity: {
        id: string;
        type: 'user_signup' | 'post_created';
        description: string;
        time: string;
    }[];
    growthRate?: number;
}

export const useAnalytics = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        userGrowth: [],
        recentActivity: [],
        growthRate: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Fetch Users from Edge Function (auth.users)
            let users: any[] = [];
            try {
                const { data, error: fnError } = await supabase.functions.invoke('get-auth-users');
                if (fnError) throw fnError;
                if (!data?.users) throw new Error('No user data');
                users = data.users;
            } catch (e) {
                console.warn('Edge function failed, falling back to profiles:', e);
                // Fallback to profiles table
                const { data: profileData } = await (supabase as any)
                    .from('profiles')
                    .select('id, created_at, preferred_name')
                    .order('created_at', { ascending: false });
                users = profileData || [];
            }

            // 2. Fetch Blog Posts
            const { count: postsCount, error: postsError } = await (supabase as any)
                .from('blog_posts')
                .select('*', { count: 'exact', head: true });

            if (postsError) throw postsError;

            // 3. Process User Growth (Last 6 months)
            const growthMap = new Map<string, number>();
            const today = new Date();

            // Initialize last 6 months with 0
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(today, i);
                const key = format(date, 'MMM yyyy');
                growthMap.set(key, 0);
            }

            users.forEach((user: any) => {
                const date = parseISO(user.created_at);
                const key = format(date, 'MMM yyyy');
                if (growthMap.has(key)) {
                    growthMap.set(key, (growthMap.get(key) || 0) + 1);
                }
            });

            // Convert to cumulative or monthly array? 
            // Let's do cumulative growth for the chart
            const growthArray: { date: string; count: number }[] = [];
            let cumulative = 0;
            // Note: This logic assumes we only have 6 months of data or we are only showing growth IN those months.
            // For true cumulative, we'd need total before the window. 
            // For simplicity, let's show "New Users per Month" which is usually more interesting for activity.

            Array.from(growthMap.entries()).forEach(([date, count]) => {
                growthArray.push({ date, count });
            });

            // 4. Activity Feed (Mix of new users)
            // Taking top 5 most recent users
            const activity = users.slice(0, 5).map((user: any) => ({
                id: user.id + '_signup',
                type: 'user_signup' as const,
                description: `New user joined: ${user.preferred_name || 'Unnamed User'}`,
                time: user.created_at,
            }));

            setStats({
                totalUsers: users.length,
                activeUsers: users.length, // Placeholder logic
                totalPosts: postsCount || 0,
                userGrowth: growthArray,
                recentActivity: activity,
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return { stats, loading, refresh: fetchAnalytics };
};
