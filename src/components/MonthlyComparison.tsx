import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const MonthlyComparison = () => {
  const { getCurrentMonthSummary, getLastMonthSummary, getMonthName, loading } = useMonthlySummaries(2);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMonth = getCurrentMonthSummary();
  const lastMonth = getLastMonthSummary();

  if (!currentMonth && !lastMonth) {
    return null;
  }

  const now = new Date();
  const currentMonthName = getMonthName(now.getMonth() + 1);
  const lastMonthName = lastMonth ? getMonthName(lastMonth.month) : '';

  const currentBalance = currentMonth?.balance || 0;
  const lastBalance = lastMonth?.balance || 0;
  const difference = currentBalance - lastBalance;
  const percentChange = lastBalance !== 0 ? ((difference / Math.abs(lastBalance)) * 100) : 0;

  const getTrendIcon = () => {
    if (difference > 0) return <TrendingUp className="h-5 w-5 text-success" />;
    if (difference < 0) return <TrendingDown className="h-5 w-5 text-destructive" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (difference > 0) return `+₵${difference.toFixed(2)} better`;
    if (difference < 0) return `-₵${Math.abs(difference).toFixed(2)} worse`;
    return 'Same as last month';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Monthly Comparison
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{currentMonthName}</p>
            <p className="text-2xl font-bold">₵{(currentMonth?.balance || 0).toFixed(2)}</p>
            <div className="text-xs space-y-0.5">
              <p className="text-success">+₵{(currentMonth?.income || 0).toFixed(2)}</p>
              <p className="text-destructive">-₵{(currentMonth?.expenses || 0).toFixed(2)}</p>
            </div>
          </div>
          
          {lastMonth && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{lastMonthName}</p>
              <p className="text-2xl font-bold text-muted-foreground">₵{lastBalance.toFixed(2)}</p>
              <div className="text-xs space-y-0.5 text-muted-foreground">
                <p>+₵{lastMonth.income.toFixed(2)}</p>
                <p>-₵{lastMonth.expenses.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {lastMonth && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">{getTrendText()}</p>
            {percentChange !== 0 && (
              <p className="text-xs text-muted-foreground">
                {Math.abs(percentChange).toFixed(1)}% {difference > 0 ? 'increase' : 'decrease'}
              </p>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full mt-2 text-primary hover:text-primary/80"
          onClick={() => navigate('/analytics')}
        >
          View All Months
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
