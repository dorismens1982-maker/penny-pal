import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMonthlySummaries } from './useMonthlySummaries';
import { useCategoryAnalytics } from './useCategoryAnalytics';

export const useMonthlyRecap = () => {
    const { user } = useAuth();
    const { getLastMonthSummary, summaries } = useMonthlySummaries();
    const { getTopCategoryForMonth } = useCategoryAnalytics();
    const [showRecap, setShowRecap] = useState(false);
    const [recapData, setRecapData] = useState<any>(null);

    useEffect(() => {
        if (!user || summaries.length === 0) return;

        const checkRecap = async () => {
            const now = new Date();
            const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
            const lastSeenRecap = localStorage.getItem(`penny_pal_recap_seen_${user.id}`);

            // Logic: If we haven't seen a recap for the CURRENT month, show the PREVIOUS month's data
            if (lastSeenRecap !== currentMonthKey) {

                // 1. Get Last Month's Data
                const lastMonthSummary = getLastMonthSummary();

                // Only show if there was actual activity last month
                if (lastMonthSummary && (lastMonthSummary.income > 0 || lastMonthSummary.expenses > 0)) {

                    // 2. Calculate Trends (Last Month vs 2 Months Ago)
                    const twoMonthsAgoDate = new Date();
                    twoMonthsAgoDate.setMonth(twoMonthsAgoDate.getMonth() - 2);
                    const twoMonthsAgoMonth = twoMonthsAgoDate.getMonth() + 1;
                    const twoMonthsAgoYear = twoMonthsAgoDate.getFullYear();

                    const twoMonthsAgoSummary = summaries.find(s => s.month === twoMonthsAgoMonth && s.year === twoMonthsAgoYear);

                    let spendingTrend = 0;
                    if (twoMonthsAgoSummary && twoMonthsAgoSummary.expenses > 0) {
                        spendingTrend = ((lastMonthSummary.expenses - twoMonthsAgoSummary.expenses) / twoMonthsAgoSummary.expenses) * 100;
                    }

                    // 3. Get Top Category
                    const topCategoryData = getTopCategoryForMonth(lastMonthSummary.month, lastMonthSummary.year);

                    setRecapData({
                        month: lastMonthSummary.month,
                        year: lastMonthSummary.year,
                        income: lastMonthSummary.income,
                        expenses: lastMonthSummary.expenses,
                        saved: lastMonthSummary.income - lastMonthSummary.expenses,
                        spendingTrend,
                        topCategory: topCategoryData?.topCategory,
                        topCategoryAmount: topCategoryData?.topCategoryAmount
                    });

                    setShowRecap(true);
                }
            }
        };

        checkRecap();
    }, [user, summaries]);

    const closeRecap = () => {
        if (!user) return;
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        localStorage.setItem(`penny_pal_recap_seen_${user.id}`, currentMonthKey);
        setShowRecap(false);
    };

    const manuallyTriggerRecap = () => {
        // For testing, just show the last available data or current month
        const now = new Date();
        // Mock data or fetch real data for preview
        // For simplicity, we just trigger the same logic but force it

        // 1. Get Last Month's Data (or current if last is empty for new users)
        let summary = getLastMonthSummary();
        if (!summary && summaries.length > 0) summary = summaries[0];

        // If still no summary (brand new user), create a mock one for preview
        if (!summary) {
            summary = {
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                income: 1500,
                expenses: 1200,
                balance: 300,
                transaction_count: 5,
                user_id: user?.id || '',
                id: 'mock',
                created_at: now.toISOString(),
                updated_at: now.toISOString()
            };
        }

        const topCategoryData = getTopCategoryForMonth(summary.month, summary.year) || { topCategory: 'Food & Dining', topCategoryAmount: 450 };

        setRecapData({
            month: summary.month,
            year: summary.year,
            income: summary.income,
            expenses: summary.expenses,
            saved: summary.income - summary.expenses,
            spendingTrend: -12.5, // Mock trend for preview
            topCategory: topCategoryData?.topCategory,
            topCategoryAmount: topCategoryData?.topCategoryAmount
        });

        setShowRecap(true);
    };

    return { showRecap, recapData, closeRecap, manuallyTriggerRecap };
};
