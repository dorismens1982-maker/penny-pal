import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyCategoryData {
  month: number;
  year: number;
  topCategory: string;
  topCategoryAmount: number;
  bottomCategory?: string;
  bottomCategoryAmount?: number;
  categories: CategorySpending[];
}

interface UseCategoryAnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
}

export const useCategoryAnalytics = (options?: UseCategoryAnalyticsOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('date', { ascending: false });

      if (options?.startDate) {
        query = query.gte('date', options.startDate.toISOString().split('T')[0]);
      }

      if (options?.endDate) {
        query = query.lte('date', options.endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching category data',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, options?.startDate, options?.endDate]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('category-analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, options?.startDate, options?.endDate]);

  const topCategories = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach((transaction) => {
      const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
      categoryMap.set(transaction.category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

    const totalAmount = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    const categories: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return categories;
  }, [transactions]);

  const monthlyCategoryData = useMemo(() => {
    const monthlyMap = new Map<string, Map<string, number>>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, new Map());
      }

      const categoryMap = monthlyMap.get(monthKey)!;
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + transaction.amount);
    });

    const result: MonthlyCategoryData[] = [];

    monthlyMap.forEach((categoryMap, monthKey) => {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      const categories: CategorySpending[] = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          count: 0,
          percentage: 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      const topCategory = categories[0];
      // Get bottom category (lowest non-zero spending)
      const bottomCategory = categories.length > 1 ? categories[categories.length - 1] : undefined;

      result.push({
        month,
        year,
        topCategory: topCategory?.category || '',
        topCategoryAmount: topCategory?.amount || 0,
        bottomCategory: bottomCategory?.category,
        bottomCategoryAmount: bottomCategory?.amount,
        categories,
      });
    });

    return result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [transactions]);

  const getTopCategoryForMonth = (month: number, year: number) => {
    return monthlyCategoryData.find((m) => m.month === month && m.year === year);
  };

  const categoryTrends = useMemo(() => {
    const trends = new Map<string, { current: number; previous: number; change: number }>();

    if (monthlyCategoryData.length < 2) return [];

    const currentMonth = monthlyCategoryData[0];
    const previousMonth = monthlyCategoryData[1];

    currentMonth.categories.forEach((category) => {
      const prevCategory = previousMonth.categories.find((c) => c.category === category.category);
      const prevAmount = prevCategory?.amount || 0;
      const change = prevAmount > 0 ? ((category.amount - prevAmount) / prevAmount) * 100 : 0;

      trends.set(category.category, {
        current: category.amount,
        previous: prevAmount,
        change,
      });
    });

    return Array.from(trends.entries())
      .map(([category, data]) => ({
        category,
        ...data,
      }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [monthlyCategoryData]);

  return {
    topCategories,
    monthlyCategoryData,
    categoryTrends,
    loading,
    refetch: fetchTransactions,
    getTopCategoryForMonth,
  };
};
