import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { TrendingUp, TrendingDown, Calendar, Minus, ChevronUp, ChevronDown, ShoppingBag } from 'lucide-react';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker, DateRange, DateRangePreset } from '@/components/DateRangePicker';
import { getOverallTrend, getMonthTrend } from '@/utils/trendCalculations';
import { Progress } from '@/components/ui/progress';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('all');

  const { summaries, loading, getMonthName } = useMonthlySummaries({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const { topCategories, loading: categoryLoading, getTopCategoryForMonth } = useCategoryAnalytics({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const handleDateRangeChange = (range: DateRange, preset: DateRangePreset) => {
    setDateRange(range);
    setSelectedPreset(preset);
  };

  const overallTrend = useMemo(() => getOverallTrend(summaries), [summaries]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const totalBalance = summaries.reduce((sum, s) => sum + Number(s.income) - Number(s.expenses), 0);

  const TrendIndicator = ({ trend }: { trend: any }) => {
    if (!trend) return null;
    const Icon = trend.direction === 'up' ? ChevronUp : trend.direction === 'down' ? ChevronDown : Minus;
    const colorClass = trend.isPositive ? 'text-success' : 'text-destructive';
    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span>{Math.abs(trend.percentageChange).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-poppins font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Monthly Analytics
          </h1>
          <p className="text-muted-foreground">View your financial trends and insights</p>
        </div>

        {/* Date Range Picker */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Date Range Filter</h2>
          <p className="text-sm text-muted-foreground">
            Select a time period to analyze. All analytics below will update based on your selection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            selectedPreset={selectedPreset}
          />
          {summaries.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {summaries.length} month{summaries.length !== 1 ? 's' : ''} of data
            </p>
          )}
        </div>

        {/* ✅ Top Spending Categories */}
        {!categoryLoading && topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Top Spending Categories
                </CardTitle>
                <p className="text-sm text-muted-foreground font-normal">
                  Your highest spending categories ranked by total amount. Percentages show each category's share of total expenses.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.slice(0, 5).map((category, index) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm font-medium">{category.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.count} transactions
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₵{category.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ Month by Month Breakdown */}
        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle>Month by Month Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                Detailed monthly view showing income, expenses, and transaction counts. Badges highlight the current month and top spending category.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {summaries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transaction history yet. Start adding transactions to see your monthly breakdown!
              </p>
            ) : (
              <div className="space-y-3">
                {summaries.map((summary) => {
                  const monthName = getMonthName(summary.month);
                  const isPositive = summary.balance >= 0;
                  const now = new Date();
                  const isCurrentMonth = summary.month === now.getMonth() + 1 && summary.year === now.getFullYear();
                  const monthTrend = getMonthTrend(summaries, summary.month, summary.year);
                  const topCategory = getTopCategoryForMonth(summary.month, summary.year);

                  return (
                    <div
                      key={summary.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {monthName} {summary.year}
                          </h3>
                          {isCurrentMonth && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                          {topCategory && topCategory.topCategory && (
                            <Badge variant="secondary" className="text-xs">
                              Top: {topCategory.topCategory}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {monthTrend && (
                            <div className={`text-xs ${monthTrend.isPositive ? 'text-success' : 'text-destructive'}`}>
                              {monthTrend.direction === 'up' ? '↑' : monthTrend.direction === 'down' ? '↓' : '→'}
                              {Math.abs(monthTrend.percentageChange).toFixed(0)}%
                            </div>
                          )}
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className={`font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                            ₵{Math.abs(summary.balance).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Income</p>
                          <p className="font-medium text-success">
                            +₵{Number(summary.income).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Expenses</p>
                          <p className="font-medium text-destructive">
                            -₵{Number(summary.expenses).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Transactions</p>
                          <p className="font-medium">{summary.transaction_count}</p>
                        </div>
                      </div>

                      {topCategory && topCategory.topCategory && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Spent ₵{topCategory.topCategoryAmount.toFixed(2)} on {topCategory.topCategory}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
