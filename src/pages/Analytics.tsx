import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Minus, ChevronUp, ChevronDown, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { Badge } from '@/components/ui/badge';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from 'recharts';
import { DateRangePicker, DateRange, DateRangePreset } from '@/components/DateRangePicker';
import { getOverallTrend, getMonthTrend, getSpendingTrendSummary } from '@/utils/trendCalculations';
import { Progress } from '@/components/ui/progress';

export default function Analytics() {
  const navigate = useNavigate();
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
  const spendingTrendSummary = useMemo(() => getSpendingTrendSummary(summaries), [summaries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = summaries
    .slice()
    .reverse()
    .map(summary => ({
      month: `${getMonthName(summary.month).slice(0, 3)} ${summary.year}`,
      income: Number(summary.income),
      expenses: Number(summary.expenses),
      balance: Number(summary.balance),
    }));

  const totalIncome = summaries.reduce((sum, s) => sum + Number(s.income), 0);
  const totalExpenses = summaries.reduce((sum, s) => sum + Number(s.expenses), 0);
  const totalBalance = totalIncome - totalExpenses;
  const avgMonthlyIncome = summaries.length > 0 ? totalIncome / summaries.length : 0;
  const avgMonthlyExpenses = summaries.length > 0 ? totalExpenses / summaries.length : 0;

  const TrendIndicator = ({ trend, label }: { trend: any; label: string }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Monthly Analytics
          </h1>
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

        {overallTrend && (
          <Card className={`border-l-4 ${
            spendingTrendSummary.type === 'positive' ? 'border-l-success' :
            spendingTrendSummary.type === 'negative' ? 'border-l-destructive' :
            'border-l-muted'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Spending Trend Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{spendingTrendSummary.message}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-success">₵{totalIncome.toFixed(2)}</p>
                {overallTrend && <TrendIndicator trend={overallTrend.income} label="Income" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ₵{avgMonthlyIncome.toFixed(2)}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-destructive">₵{totalExpenses.toFixed(2)}</p>
                {overallTrend && <TrendIndicator trend={overallTrend.expenses} label="Expenses" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ₵{avgMonthlyExpenses.toFixed(2)}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₵{totalBalance.toFixed(2)}
                </p>
                {overallTrend && <TrendIndicator trend={overallTrend.balance} label="Balance" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPreset === 'all' ? 'All time' : 'Selected period'}
              </p>
            </CardContent>
          </Card>
        </div>

        {!categoryLoading && topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Top Spending Categories
              </CardTitle>
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

        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Month by Month Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {summaries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transaction history yet. Start adding transactions to see your monthly breakdown!
              </p>
            ) : (
              <div className="space-y-3">
                {summaries.map((summary, index) => {
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
    </div>
  );
}
