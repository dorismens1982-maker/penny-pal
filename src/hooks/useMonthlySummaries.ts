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

      let filteredData = data || [];

      if (options?.startDate || options?.endDate) {
        filteredData = filteredData.filter((summary) => {
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

      setSummaries(filteredData);
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
    
    return summaries.find(s => s.month === currentMonth && s.year === currentYear);
  };

  const getLastMonthSummary = () => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    return summaries.find(s => s.month === lastMonth && s.year === lastMonthYear);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  useEffect(() => {
    fetchSummaries();
  }, [user, options?.startDate, options?.endDate, options?.limit]);

  // Set up real-time subscription for monthly_summaries
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
