import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MonthlySummary {
  id: string;
  user_id: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  transaction_count: number;
  created_at: string;
  updated_at: string;
}

interface UseMonthlySummariesOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export const useMonthlySummaries = (options?: UseMonthlySummariesOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummaries = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      let fetchedData = data || [];

      // Apply date filters if provided
      if (options?.startDate || options?.endDate) {
        fetchedData = fetchedData.filter((summary) => {
          const summaryDate = new Date(summary.year, summary.month - 1);

          if (options.startDate && options.endDate) {
            const start = new Date(options.startDate.getFullYear(), options.startDate.getMonth());
            const end = new Date(options.endDate.getFullYear(), options.endDate.getMonth());
            return summaryDate >= start && summaryDate <= end;
          }

          if (options.startDate) {
            const start = new Date(options.startDate.getFullYear(), options.startDate.getMonth());
            return summaryDate >= start;
          }

          if (options.endDate) {
            const end = new Date(options.endDate.getFullYear(), options.endDate.getMonth());
            return summaryDate <= end;
          }

          return true;
        });
      }

      // 🧩 NEW FEATURE: Always show the last 3 months (even with no data)
      const now = new Date();
      const last3Months = Array.from({ length: 3 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { month: d.getMonth() + 1, year: d.getFullYear() };
      }).reverse(); // show oldest first

      // Merge fetched summaries with zero-value placeholders
      const mergedSummaries = last3Months.map((m) => {
        const existing = fetchedData.find(
          (s) => s.month === m.month && s.year === m.year
        );
        return (
          existing || {
            id: `${m.year}-${m.month}`,
            user_id: user.id,
            month: m.month,
            year: m.year,
            income: 0,
            expenses: 0,
            balance: 0,
            transaction_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      });

      setSummaries(mergedSummaries);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching monthly summaries',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthSummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return summaries.find((s) => s.month === currentMonth && s.year === currentYear);
  };

  const getLastMonthSummary = () => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return summaries.find((s) => s.month === lastMonth && s.year === lastMonthYear);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  useEffect(() => {
    fetchSummaries();
  }, [user, options?.startDate, options?.endDate, options?.limit]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('monthly-summaries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'monthly_summaries',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSummaries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    summaries,
    loading,
    refetch: fetchSummaries,
    getCurrentMonthSummary,
    getLastMonthSummary,
    getMonthName,
  };
};
