import React, { useMemo, useState, memo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Plus, BookOpen, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MonthlyComparison } from '@/components/MonthlyComparison';
import { useNewMonthDetection } from '@/hooks/useNewMonthDetection';
import { PageHeader } from '@/components/PageHeader';
import { usePageHeader } from '@/hooks/usePageHeader';

const MAX_NOTE_LENGTH = 30;

// --- Helpers ---
const formatCurrency = (amount: number) => `₵${Math.abs(amount).toFixed(2)}`;
const dateKey = (d: Date) => {
  // Prevent timezone mismatches when comparing with stored YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// --- Recent item ---
const RecentTransactionItem = memo(({ transaction }: { transaction: any }) => {
  const truncated =
    transaction.note && transaction.note.length > MAX_NOTE_LENGTH
      ? `${transaction.note.substring(0, MAX_NOTE_LENGTH)}…`
      : transaction.note || '';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
          }`}
          aria-hidden
        >
          {transaction.type === 'income' ? (
            <ArrowUpRight className="w-4 h-4 text-income" />
          ) : (
            <ArrowDownLeft className="w-4 h-4 text-expense" />
          )}
        </div>
        <div>
          <p className="font-medium leading-none text-foreground">{transaction.category}</p>
          <p className="text-xs mt-1 text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString()}
            {truncated ? ` • ${truncated}` : ''}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            transaction.type === 'income' ? 'text-income' : 'text-expense'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  );
});
RecentTransactionItem.displayName = 'RecentTransactionItem';

// --- Small stat card ---
function StatCard({
  title,
  value,
  icon,
  tone = 'neutral',
  onClick,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'income' | 'expense' | 'neutral';
  onClick?: () => void;
}) {
  const tint =
    tone === 'income' ? 'bg-income/10 text-income' : tone === 'expense' ? 'bg-expense/10 text-expense' : 'bg-primary/10 text-primary';
  return (
    <Card
      className={`shadow-sm ${onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full grid place-items-center ${tint}`}>{icon}</div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-xl font-poppins font-bold leading-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const { transactions, balance, totals, loading } = useTransactions();
  const { profile, session } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const navigate = useNavigate();
  const { header } = usePageHeader('dashboard');

  useNewMonthDetection();

  const preferred =
    profile?.preferred_name || (session?.user?.user_metadata as any)?.preferred_name || '';

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Build day keys
  const daysBack = range === '7d' ? 7 : 30;
  const keys = useMemo(() => {
    const arr: string[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(dateKey(d));
    }
    return arr;
  }, [daysBack]);

  // Prepare chart data (memoized)
  const chartData = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    keys.forEach((k) => map.set(k, { income: 0, expenses: 0 }));

    for (const t of transactions) {
      if (!map.has(t.date)) continue; // only within range
      const entry = map.get(t.date)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expenses += t.amount;
    }

    return keys.map((k) => {
      const d = new Date(k);
      const { income, expenses } = map.get(k)!;
      return {
        key: k,
        label:
          range === '7d'
            ? d.toLocaleDateString('en-US', { weekday: 'short' })
            : d.toLocaleDateString('en-US', { day: '2-digit' }),
        income,
        expenses,
        net: income - expenses,
      };
    });
  }, [transactions, keys, range]);

  const netThisMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    let inc = 0;
    let exp = 0;
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === y && d.getMonth() === m) {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      }
    });
    return inc - exp;
  }, [transactions]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const goToTransactions = (type?: 'income' | 'expense') => {
    navigate(type ? `/transactions?type=${type}` : '/transactions');
  };

  if (loading) {
    // Lightweight skeleton for better perceived performance
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 space-y-4 animate-pulse">
          <div className="h-28 rounded-xl bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
          <div className="h-80 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddTransaction={() => setShowAddModal(true)}>
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
        {/* HERO: Greeting + Balance + Actions */}
        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-poppins font-bold text-foreground">
                  {preferred ? `${greeting}, ${preferred}!` : 'Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Your finances at a glance</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
                <Button
                  onClick={() => navigate('/blog')}
                  variant="outline"
                  className="gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                >
                  <BookOpen className="w-4 h-4" />
                  Financial Tips
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${balance >= 0 ? 'bg-income' : 'bg-expense'}`} />
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className={`text-3xl font-poppins font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Net (This Month)"
            value={formatCurrency(netThisMonth)}
            icon={<TrendingUp className="w-5 h-5" />}
            tone={netThisMonth >= 0 ? 'income' : 'expense'}
          />
          <StatCard
            title="Income (All time)"
            value={formatCurrency(totals.income)}
            icon={<ArrowUpRight className="w-5 h-5" />}
            tone="income"
            onClick={() => goToTransactions('income')}
          />
          <StatCard
            title="Expenses (All time)"
            value={formatCurrency(totals.expenses)}
            icon={<ArrowDownLeft className="w-5 h-5" />}
            tone="expense"
            onClick={() => goToTransactions('expense')}
          />
        </div>

        {/* CASHFLOW CHART */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Cashflow</CardTitle>
              </div>
              <div className="inline-flex rounded-full bg-muted p-1">
                <button
                  className={`px-3 py-1.5 text-sm rounded-full ${range === '7d' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => setRange('7d')}
                >
                  7D
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-full ${range === '30d' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => setRange('30d')}
                >
                  30D
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Net over period: <span className={chartData.reduce((a, c) => a + c.net, 0) >= 0 ? 'text-income' : 'text-expense'}>
                {formatCurrency(chartData.reduce((a, c) => a + c.net, 0))}
              </span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="label" axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12 }}
                    formatter={(value: any, name: any) => [formatCurrency(value as number), name === 'income' ? 'Income' : 'Expenses']}
                    labelFormatter={(_, p) => {
                      const key = p?.[0]?.payload?.key;
                      return new Date(key).toLocaleDateString();
                    }}
                  />

                  <Area type="monotone" dataKey="income" stroke="hsl(var(--income))" fillOpacity={1} fill="url(#incomeGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(var(--expense))" fillOpacity={1} fill="url(#expenseGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-income" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-expense" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RECENT TRANSACTIONS */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Button variant="ghost" className="h-8 px-2 text-sm" onClick={() => goToTransactions()}>
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-3">No transactions yet</p>
                <button onClick={() => setShowAddModal(true)} className="text-primary hover:underline">
                  Add your first transaction
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <RecentTransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MONTHLY COMPARISON (demoted / below the fold) */}
        <div className="mt-2">
          <MonthlyComparison />
        </div>
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
    </Layout>
  );
};

export default Dashboard;
