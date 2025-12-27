import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowDownLeft, Wallet, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TransactionRow } from './TransactionRow';
import { formatCurrency } from '@/utils/currency';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { CurrencyCode } from '@/utils/currencyConfig';

interface OverviewTabProps {
    totals: { income: number; expenses: number };
    balance: number;
    chartData: any[];
    transactions: any[];
    onAddTransaction: () => void;
    onDeleteTransaction: (id: string) => void;
    onViewIncome?: () => void;
    onViewExpenses?: () => void;
    onEditTransaction: (t: any) => void;
    currency: CurrencyCode;
}

export const OverviewTab = ({
    totals,
    balance,
    chartData,
    transactions,
    onAddTransaction,
    onDeleteTransaction,
    onViewIncome,
    onViewExpenses,
    onEditTransaction,
    currency,
}: OverviewTabProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" id="tour-balance">
                <Card
                    className="shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={onViewIncome}
                >
                    <CardContent className="p-3 md:p-4 flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-primary/10 text-primary shrink-0">
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground truncate">Income</p>
                            <p className="text-sm md:text-xl font-poppins font-bold text-income truncate">
                                {formatCurrency(totals.income, currency)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className="shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={onViewExpenses}
                >
                    <CardContent className="p-3 md:p-4 flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-expense/10 text-expense shrink-0">
                            <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground truncate">Expenses</p>
                            <p className="text-sm md:text-xl font-poppins font-bold text-expense truncate">
                                {formatCurrency(totals.expenses, currency)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm col-span-2 md:col-span-1">
                    <CardContent className="p-3 md:p-4 flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-muted shrink-0">
                            <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Net Balance</p>
                            <p className={`text-base md:text-xl font-poppins font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                                {formatCurrency(balance, currency)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cashflow Chart */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        7-Day Cashflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full">
                        <ChartContainer config={{
                            income: {
                                label: "Income",
                                color: "hsl(var(--income))",
                            },
                            expenses: {
                                label: "Expenses",
                                color: "hsl(var(--expense))",
                            },
                        }} className="h-full w-full">
                            <AreaChart data={chartData} margin={{ left: -20, right: 12, top: 12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.1)" />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    className="text-xs font-medium text-muted-foreground"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    className="text-xs font-medium text-muted-foreground"
                                    tickFormatter={(value) => `${value}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Area
                                    dataKey="expenses"
                                    type="natural"
                                    fill="url(#fillExpenses)"
                                    fillOpacity={0.4}
                                    stroke="hsl(var(--expense))"
                                    strokeWidth={3}
                                    stackId="a"
                                />
                                <Area
                                    dataKey="income"
                                    type="natural"
                                    fill="url(#fillIncome)"
                                    fillOpacity={0.4}
                                    stroke="hsl(var(--income))"
                                    strokeWidth={3}
                                    stackId="b"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Strategy Banner */}
            <div className="relative w-full h-32 md:h-48 rounded-2xl overflow-hidden shadow-sm group cursor-default">
                <img
                    src={getCloudinaryUrl('vibe_strategy.png')}
                    alt="Financial Strategy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-6 md:p-8">
                    <div>
                        <h3 className="text-white font-poppins font-bold text-lg md:text-2xl mb-1">Every Move Counts</h3>
                        <p className="text-white/80 text-xs md:text-sm max-w-[200px] md:max-w-none">Review your recent moves below.</p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-3">No transactions yet</p>
                            <Button onClick={onAddTransaction} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add your first transaction
                            </Button>
                        </div>
                    ) : (
                        <div>
                            {transactions.slice(0, 5).map((t) => (
                                <TransactionRow key={t.id} t={t} onDelete={onDeleteTransaction} onEdit={onEditTransaction} currency={currency} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
