import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Minus,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker, DateRange, DateRangePreset } from '@/components/DateRangePicker';
import { getOverallTrend, getMonthTrend } from '@/utils/trendCalculations';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/PageHeader';
import { usePageHeader } from '@/hooks/usePageHeader';

const format = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 2 });

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('all');
  const { header } = usePageHeader('analytics');

  const { summaries, loading, getMonthName } = useMonthlySummaries({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const {
    topCategories,
    loading: categoryLoading,
    getTopCategoryForMonth,
  } = useCategoryAnalytics({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const handleDateRangeChange = (range: DateRange, preset: DateRangePreset) => {
    setDateRange(range);
    setSelectedPreset(preset);
  };

  const overallTrend = useMemo(() => getOverallTrend(summaries), [summaries]);

  // Derived KPIs for the selected range
  const kpis = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const s of summaries) {
      income += Number(s.income);
      expenses += Number(s.expenses);
    }
    return {
      income,
      expenses,
      net: income - expenses,
      monthsCount: summaries.length,
    };
  }, [summaries]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 space-y-3 animate-pulse">
          <div className="h-12 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-20 rounded-xl bg-muted" />
          </div>
          <div className="h-40 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  const TrendChip = ({ trend }: { trend: any }) => {
    if (!trend) return null;
    const Icon =
      trend.direction === 'up' ? ChevronUp : trend.direction === 'down' ? ChevronDown : Minus;
    const colorClass = trend.isPositive ? 'text-success' : 'text-destructive';
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(trend.percentageChange).toFixed(1)}%
      </span>
    );
  };

  return (
    <Layout>
      {header && (
        <PageHeader
          title={header.title}
          subtitle={header.subtitle}
          imageUrl={header.image_url}
          mobileImageUrl={header.mobile_image_url}
          altText={header.alt_text}
          heightMobile={header.height_mobile}
          heightDesktop={header.height_desktop}
          overlayOpacity={header.overlay_opacity}
          textColor={header.text_color}
        />
      )}
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border -mx-4 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h1 className="text-base sm:text-lg font-semibold">Monthly Analytics</h1>
            </div>
            {kpis.monthsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Showing {kpis.monthsCount} month{kpis.monthsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="mt-2">
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} selectedPreset={selectedPreset} />
          </div>
        </div>

        {/* Hero Summary */}
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Balance (selected range)</p>
                <p className={`text-2xl sm:text-3xl font-poppins font-bold ${kpis.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {format.format(kpis.net)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Overall Trend</p>
                <TrendChip trend={overallTrend} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Trio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard label="Income" value={format.format(kpis.income)} tone="success" icon={<TrendingUp className="w-4 h-4" />} />
          <KpiCard label="Expenses" value={format.format(kpis.expenses)} tone="destructive" icon={<TrendingDown className="w-4 h-4" />} />
          <KpiCard label="Net" value={format.format(kpis.net)} tone={kpis.net >= 0 ? 'success' : 'destructive'} icon={<Minus className="w-4 h-4" />} />
        </div>

        {/* Top Categories (collapsible on mobile) */}
        {!categoryLoading && topCategories.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="h-5 w-5" />
                Top Spending Categories
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Share of total expenses in the selected period.
              </p>
            </CardHeader>
            <CardContent>
              <CategoryList categories={topCategories} />
            </CardContent>
          </Card>
        )}

        {/* Month-by-Month (Accordion) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Month by Month</CardTitle>
            <p className="text-xs text-muted-foreground">
              Tap a month to see details. Trends compare to the previous month available in the range.
            </p>
          </CardHeader>
          <CardContent>
            {summaries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transaction history yet.
              </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {summaries.map((summary) => {
                  const monthName = getMonthName(summary.month);
                  const isPositive = summary.balance >= 0;
                  const now = new Date();
                  const isCurrentMonth =
                    summary.month === now.getMonth() + 1 && summary.year === now.getFullYear();
                  const monthTrend = getMonthTrend(summaries, summary.month, summary.year);
                  const topCat = getTopCategoryForMonth(summary.month, summary.year);

                  return (
                    <AccordionItem key={summary.id} value={`${summary.year}-${summary.month}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {monthName} {summary.year}
                            </span>
                            {isCurrentMonth && <Badge className="text-[10px]">Current</Badge>}
                            {topCat?.topCategory && (
                              <Badge variant="secondary" className="text-[10px]">
                                Top: {topCat.topCategory}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {monthTrend && (
                              <span
                                className={`text-xs ${
                                  monthTrend.isPositive ? 'text-success' : 'text-destructive'
                                }`}
                              >
                                {monthTrend.direction === 'up'
                                  ? '↑'
                                  : monthTrend.direction === 'down'
                                  ? '↓'
                                  : '→'}
                                {Math.abs(monthTrend.percentageChange).toFixed(0)}%
                              </span>
                            )}
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span
                              className={`font-semibold ${
                                isPositive ? 'text-success' : 'text-destructive'
                              }`}
                            >
                              {format.format(Math.abs(summary.balance))}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-3 gap-4 text-sm pt-2">
                          <div>
                            <p className="text-muted-foreground text-xs">Income</p>
                            <p className="font-medium text-success">
                              +{format.format(Number(summary.income))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Expenses</p>
                            <p className="font-medium text-destructive">
                              -{format.format(Number(summary.expenses))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Transactions</p>
                            <p className="font-medium">{summary.transaction_count}</p>
                          </div>
                        </div>
                        {topCat?.topCategory && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              Spent {format.format(topCat.topCategoryAmount)} on {topCat.topCategory}
                            </p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

/* --- Small presentational pieces --- */

function KpiCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: 'success' | 'destructive';
  icon: React.ReactNode;
}) {
  const tint =
    tone === 'success'
      ? 'bg-success/10 text-success'
      : 'bg-destructive/10 text-destructive';
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full grid place-items-center ${tint}`}>
            {icon}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-xl font-poppins font-bold leading-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryList({
  categories,
}: {
  categories: Array<{ category: string; amount: number; percentage: number; count: number }>;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? categories : categories.slice(0, 3);

  return (
    <div className="space-y-4">
      {visible.map((c, i) => (
        <div key={c.category}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{i + 1}.</span>
              <span className="text-sm font-medium">{c.category}</span>
              <Badge variant="outline" className="text-[10px]">
                {c.count} txns
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{format.format(c.amount)}</p>
              <p className="text-xs text-muted-foreground">{c.percentage.toFixed(1)}%</p>
            </div>
          </div>
          <Progress value={c.percentage} className="h-2" />
        </div>
      ))}
      {categories.length > 3 && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? 'Show less' : `Show all ${categories.length}`}
        </button>
      )}
    </div>
  );
}
