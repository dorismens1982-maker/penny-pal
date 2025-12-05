import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowDownLeft, Wallet, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TransactionRow } from './TransactionRow';
import { formatCurrency } from '@/utils/currency';

interface OverviewTabProps {
    totals: { income: number; expenses: number };
    balance: number;
    chartData: any[];
    transactions: any[];
    onAddTransaction: () => void;
    onDeleteTransaction: (id: string) => void;
}

export const OverviewTab = ({
    totals,
    balance,
    chartData,
    transactions,
    onAddTransaction,
    onDeleteTransaction,
}: OverviewTabProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card className="shadow-sm">
                    <CardContent className="p-3 md:p-4 flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-primary/10 text-primary shrink-0">
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground truncate">Income</p>
                            <p className="text-sm md:text-xl font-poppins font-bold text-income truncate">
                                {formatCurrency(totals.income)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-3 md:p-4 flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-expense/10 text-expense shrink-0">
                            <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground truncate">Expenses</p>
                            <p className="text-sm md:text-xl font-poppins font-bold text-expense truncate">
                                {formatCurrency(totals.expenses)}
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
                                {formatCurrency(balance)}
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
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" axisLine={false} tickLine={false} className="text-xs" />
                                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                                <Tooltip contentStyle={{ borderRadius: 12 }} />
                                <Area type="monotone" dataKey="income" stroke="hsl(var(--income))" fillOpacity={1} fill="url(#incomeGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="expenses" stroke="hsl(var(--expense))" fillOpacity={1} fill="url(#expenseGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

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
                                <TransactionRow key={t.id} t={t} onDelete={onDeleteTransaction} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
