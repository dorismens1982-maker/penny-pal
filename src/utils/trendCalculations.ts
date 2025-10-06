import { MonthlySummary } from '@/hooks/useMonthlySummaries';

export interface TrendData {
  value: number;
  change: number;
  percentageChange: number;
  direction: 'up' | 'down' | 'neutral';
  isPositive: boolean;
}

export const calculateTrend = (
  current: number,
  previous: number,
  isIncomeMetric: boolean = false
): TrendData => {
  const change = current - previous;
  const percentageChange = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;

  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (change > 0) direction = 'up';
  else if (change < 0) direction = 'down';

  const isPositive = isIncomeMetric ? change >= 0 : change <= 0;

  return {
    value: current,
    change,
    percentageChange,
    direction,
    isPositive,
  };
};

export const calculateMovingAverage = (
  summaries: MonthlySummary[],
  field: 'income' | 'expenses' | 'balance',
  periods: number = 3
): number => {
  if (summaries.length < periods) {
    return summaries.reduce((sum, s) => sum + Number(s[field]), 0) / summaries.length;
  }

  const recent = summaries.slice(0, periods);
  return recent.reduce((sum, s) => sum + Number(s[field]), 0) / periods;
};

export const getOverallTrend = (summaries: MonthlySummary[]): {
  income: TrendData;
  expenses: TrendData;
  balance: TrendData;
} | null => {
  if (summaries.length < 2) return null;

  const current = summaries[0];
  const previous = summaries[1];

  return {
    income: calculateTrend(Number(current.income), Number(previous.income), true),
    expenses: calculateTrend(Number(current.expenses), Number(previous.expenses), false),
    balance: calculateTrend(Number(current.balance), Number(previous.balance), true),
  };
};

export const getMonthTrend = (
  summaries: MonthlySummary[],
  month: number,
  year: number
): TrendData | null => {
  const currentIndex = summaries.findIndex((s) => s.month === month && s.year === year);

  if (currentIndex === -1 || currentIndex === summaries.length - 1) return null;

  const current = summaries[currentIndex];
  const previous = summaries[currentIndex + 1];

  return calculateTrend(Number(current.balance), Number(previous.balance), true);
};

export const getSpendingTrendSummary = (summaries: MonthlySummary[]): {
  message: string;
  type: 'positive' | 'negative' | 'neutral';
  avgMonthlyChange: number;
} => {
  if (summaries.length < 3) {
    return {
      message: 'Not enough data to calculate spending trends',
      type: 'neutral',
      avgMonthlyChange: 0,
    };
  }

  const recentExpenses = summaries.slice(0, 3).map((s) => Number(s.expenses));
  const changes = [];

  for (let i = 0; i < recentExpenses.length - 1; i++) {
    const change = ((recentExpenses[i] - recentExpenses[i + 1]) / recentExpenses[i + 1]) * 100;
    changes.push(change);
  }

  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

  let message = '';
  let type: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (avgChange > 5) {
    message = `Your spending is increasing by an average of ${avgChange.toFixed(1)}% per month`;
    type = 'negative';
  } else if (avgChange < -5) {
    message = `Your spending is decreasing by an average of ${Math.abs(avgChange).toFixed(1)}% per month`;
    type = 'positive';
  } else {
    message = 'Your spending is relatively stable';
    type = 'neutral';
  }

  return {
    message,
    type,
    avgMonthlyChange: avgChange,
  };
};
