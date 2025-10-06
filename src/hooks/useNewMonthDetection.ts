import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMonthlySummaries } from './useMonthlySummaries';

const LAST_LOGIN_MONTH_KEY = 'kudimate_last_login_month';

export const useNewMonthDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getLastMonthSummary, getMonthName } = useMonthlySummaries(2);

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const lastLoginMonth = localStorage.getItem(LAST_LOGIN_MONTH_KEY);

    // If this is a new month (or first login)
    if (lastLoginMonth && lastLoginMonth !== currentMonthKey) {
      const lastMonth = getLastMonthSummary();
      
      if (lastMonth) {
        const monthName = getMonthName(lastMonth.month);
        const savings = lastMonth.balance;
        const savingsText = savings >= 0 
          ? `you saved ₵${Math.abs(savings).toFixed(2)}`
          : `you spent ₵${Math.abs(savings).toFixed(2)} more than you earned`;

        toast({
          title: '🎯 New month, new goals!',
          description: `Last month (${monthName}) ${savingsText}. Let's do even better this month! 💪`,
          duration: 8000,
        });
      } else {
        toast({
          title: '🎯 Welcome to a new month!',
          description: "Ready to track your finances? Let's make this month count! 💪",
          duration: 6000,
        });
      }
    }

    // Update last login month
    localStorage.setItem(LAST_LOGIN_MONTH_KEY, currentMonthKey);
  }, [user]);
};
