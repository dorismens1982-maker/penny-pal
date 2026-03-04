import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
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
                const { data: profileData } = await (supabase as any)
                    .from('profiles')
                    .select('id, created_at, preferred_name')
                    .order('created_at', { ascending: false });
                users = profileData || [];
            }

            // 2. Fetch Blog Posts count (independently, so failure doesn't kill other stats)
            let postsCount = 0;
            try {
                const { count, error: postsError } = await (supabase as any)
                    .from('blog_posts')
                    .select('*', { count: 'exact', head: true });

                if (!postsError) {
                    postsCount = count || 0;
                } else {
                    console.warn('Blog posts fetch failed:', postsError.message);
                }
            } catch (e) {
                console.warn('Blog posts fetch exception:', e);
            }

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
                try {
                    const date = parseISO(user.created_at);
                    const key = format(date, 'MMM yyyy');
                    if (growthMap.has(key)) {
                        growthMap.set(key, (growthMap.get(key) || 0) + 1);
                    }
                } catch (_) { /* skip malformed dates */ }
            });

            const growthArray: { date: string; count: number }[] = [];
            Array.from(growthMap.entries()).forEach(([date, count]) => {
                growthArray.push({ date, count });
            });

            // 4. Calculate real growth rate: (this month vs last month) as a %
            const thisMonthKey = format(today, 'MMM yyyy');
            const lastMonthKey = format(subMonths(today, 1), 'MMM yyyy');
            const thisMonthCount = growthMap.get(thisMonthKey) || 0;
            const lastMonthCount = growthMap.get(lastMonthKey) || 0;

            let growthRate = 0;
            if (lastMonthCount > 0) {
                growthRate = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
            } else if (thisMonthCount > 0) {
                growthRate = 100; // First users this month with none last month = 100% growth
            }

            // 5. Activity Feed — top 5 most recent signups
            const activity = users.slice(0, 5).map((user: any) => ({
                id: user.id + '_signup',
                type: 'user_signup' as const,
                description: `New user joined: ${user.user_metadata?.preferred_name || user.email?.split('@')[0] || 'Unnamed User'}`,
                time: user.created_at,
            }));

            setStats({
                totalUsers: users.length,
                activeUsers: users.length, // Placeholder: Real active tracking would require last_sign_in_at data
                totalPosts: postsCount,
                userGrowth: growthArray,
                recentActivity: activity,
                growthRate,
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
