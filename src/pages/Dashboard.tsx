import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AddTransactionModal } from '@/components/AddTransactionModal';

const Dashboard = () => {
  const { transactions, balance, totals, loading } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Prepare chart data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date === date);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      income,
      expenses,
      net: income - expenses
    };
  });

  const formatCurrency = (amount: number) => `₵${Math.abs(amount).toFixed(2)}`;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddTransaction={() => setShowAddModal(true)}>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-poppins font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track your finances at a glance</p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Balance */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-8 rounded-full ${balance >= 0 ? 'bg-income' : 'bg-expense'}`} />
                <div>
                  <p className={`text-2xl font-poppins font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">Current balance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-income/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-income" />
                </div>
                <div>
                  <p className="text-2xl font-poppins font-bold text-income">
                    {formatCurrency(totals.income)}
                  </p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-expense/10 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-expense" />
                </div>
                <div>
                  <p className="text-2xl font-poppins font-bold text-expense">
                    {formatCurrency(totals.expenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Summary Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Weekly Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs text-muted-foreground"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--income))"
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--expense))"
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-income" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-expense" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="text-primary hover:underline"
                >
                  Add your first transaction
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className={`w-5 h-5 text-income`} />
                        ) : (
                          <ArrowDownLeft className={`w-5 h-5 text-expense`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      {transaction.note && (
                        <p className="text-xs text-muted-foreground">{transaction.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddTransactionModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </Layout>
  );
};

export default Dashboard;