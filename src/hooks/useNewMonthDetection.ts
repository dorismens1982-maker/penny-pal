import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMonthlySummaries } from './useMonthlySummaries';
import { useCategoryAnalytics } from './useCategoryAnalytics'; // ✅ NEW IMPORT

const LAST_LOGIN_MONTH_KEY = 'pennypal_last_login_month';

export const useNewMonthDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ Fixed: Pass correct options object
  const { getLastMonthSummary, getMonthName } = useMonthlySummaries({ limit: 3 });

  // ✅ NEW: Use category analytics to get top spending category
  const { getTopCategoryForMonth } = useCategoryAnalytics();

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const lastLoginMonth = localStorage.getItem(LAST_LOGIN_MONTH_KEY);

    // ✅ Detect new month
    if (lastLoginMonth && lastLoginMonth !== currentMonthKey) {
      const lastMonth = getLastMonthSummary();

      if (lastMonth) {
        const monthName = getMonthName(lastMonth.month);
        const savings = lastMonth.balance;
        const savingsText =
          savings >= 0
            ? `you saved ₵${Math.abs(savings).toFixed(2)}`
            : `you spent ₵${Math.abs(savings).toFixed(2)} more than you earned`;

        // ✅ NEW: Add top category insight
        const topCategory = getTopCategoryForMonth(lastMonth.month, lastMonth.year);
        const categoryText =
          topCategory && topCategory.topCategory
            ? `Your top spending was on "${topCategory.topCategory}".`
            : '';

        toast({
          title: '🎯 New month, new goals!',
          description: `Last month (${monthName}) ${savingsText}. ${categoryText} Let's do even better this month! 💪`,
          duration: 8000,
        });
      } else {
        toast({
          title: 'Welcome to a new month!',
          description: "Ready to track your finances? Let's make this month count! 💪",
          duration: 6000,
        });
      }
    }

    // ✅ Update last login month
    localStorage.setItem(LAST_LOGIN_MONTH_KEY, currentMonthKey);
  }, [user]);
};
