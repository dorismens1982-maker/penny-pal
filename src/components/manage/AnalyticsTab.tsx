import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker, DateRange, DateRangePreset } from '@/components/DateRangePicker';
import { ChevronUp, ChevronDown, ShoppingBag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrencyIntl } from '@/utils/currency';

interface AnalyticsTabProps {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    selectedPreset: DateRangePreset;
    setSelectedPreset: (preset: DateRangePreset) => void;
    kpis: { income: number; expenses: number; net: number; monthsCount: number };
    overallTrend: any;
    topCategories: { category: string; amount: number; percentage: number }[];
}

export const AnalyticsTab = ({
    dateRange,
    setDateRange,
    selectedPreset,
    setSelectedPreset,
    kpis,
    overallTrend,
    topCategories
}: AnalyticsTabProps) => {
    return (
        <div className="space-y-6">
            <div className="bg-background border-b border-border px-4 py-3 mb-4">
                <DateRangePicker
                    value={dateRange}
                    onChange={(range, preset) => {
                        setDateRange(range);
                        setSelectedPreset(preset);
                    }}
                    selectedPreset={selectedPreset}
                />
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-5 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Balance (selected range)</p>
                        <p className={`text-3xl font-poppins font-bold ${kpis.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrencyIntl.format(kpis.net)}
                        </p>
                    </div>
                    {overallTrend && overallTrend.balance && (
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Overall Trend</p>
                            <span className={`inline-flex items-center gap-1 text-sm ${overallTrend.balance.isPositive ? 'text-success' : 'text-destructive'}`}>
                                {overallTrend.balance.direction === 'up' ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                                {Math.abs(overallTrend.balance.percentageChange).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {topCategories.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Top Spending Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topCategories.slice(0, 5).map((c, i) => (
                            <div key={c.category}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{i + 1}.</span>
                                        <span className="text-sm font-medium">{c.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{formatCurrencyIntl.format(c.amount)}</p>
                                        <p className="text-xs text-muted-foreground">{c.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <Progress value={c.percentage} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
