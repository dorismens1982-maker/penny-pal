import React, { useState, memo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Plus, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MonthlyComparison } from '@/components/MonthlyComparison';
import { useNewMonthDetection } from '@/hooks/useNewMonthDetection';

const MAX_NOTE_LENGTH = 30;

const RecentTransactionItem = memo(({ transaction }: { transaction: any }) => {
  const formatCurrency = (amount: number) => `₵${Math.abs(amount).toFixed(2)}`;

  const truncateNote = (note: string | null) => {
    if (!note) return null;
    if (note.length <= MAX_NOTE_LENGTH) return note;
    return `${note.substring(0, MAX_NOTE_LENGTH)}...`;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
        }`}>
          {transaction.type === 'income' ? (
            <ArrowUpRight className="w-5 h-5 text-income" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 text-expense" />
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
          <p className="text-xs text-muted-foreground">{truncateNote(transaction.note)}</p>
        )}
      </div>
    </div>
  );
});

RecentTransactionItem.displayName = 'RecentTransactionItem';

const Dashboard = () => {
  const { transactions, balance, totals, loading } = useTransactions();
  const { profile, session } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  
  // Detect new month and show toast
  useNewMonthDetection();

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

  const greetingForNow = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const preferred = profile?.preferred_name || (session?.user?.user_metadata as any)?.preferred_name || '';
  const goToTransactions = (type: 'income' | 'expense') => {
    navigate(`/transactions?type=${type}`);
  };

  return (
    <Layout onAddTransaction={() => setShowAddModal(true)}>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 pb-2">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg ring-4 ring-primary/10">
              {preferred ? preferred.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-poppins font-bold text-foreground">
              {preferred ? `${greetingForNow()}, ${preferred}!` : greetingForNow()}
            </h1>
            <p className="text-muted-foreground">Track your finances at a glance</p>
          </div>
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
          <Card className="shadow-md cursor-pointer hover:bg-muted/30 transition-colors" role="button" tabIndex={0} onClick={() => goToTransactions('income')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToTransactions('income'); }}>
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
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="shadow-md cursor-pointer hover:bg-muted/30 transition-colors" role="button" tabIndex={0} onClick={() => goToTransactions('expense')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToTransactions('expense'); }}>
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
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison */}
        <MonthlyComparison />

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
              <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                  <div className="relative w-40 h-40">
                    <img
                      src="https://images.pexels.com/photos/6289065/pexels-photo-6289065.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Person starting financial journey"
                      className="w-full h-full object-cover rounded-full shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Plus className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Financial Journey</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Track your first transaction and take control of your spending
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  Add your first transaction
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <RecentTransactionItem key={transaction.id} transaction={transaction} />
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
