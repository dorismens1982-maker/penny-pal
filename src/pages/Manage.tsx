import React, { useState, useMemo, memo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Plus,
  Wallet,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Download,
  Trash2,
  User,
  Shield,
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { DateRangePicker, DateRange, DateRangePreset } from '@/components/DateRangePicker';
import { getOverallTrend } from '@/utils/trendCalculations';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

const formatCurrency = (amount: number) => `₵${Math.abs(amount).toFixed(2)}`;
const format = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 2 });

// Transaction Row Component
const TransactionRow = memo(({ t, onDelete }: { t: any; onDelete: (id: string) => void }) => {
  const [expand, setExpand] = useState(false);
  const MAX_NOTE_LENGTH = 50;
  const longNote = t.note && t.note.length > MAX_NOTE_LENGTH;
  const note = !t.note ? null : expand ? t.note : t.note.slice(0, MAX_NOTE_LENGTH) + (longNote ? '…' : '');

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors border-b last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-full grid place-items-center ${t.type === 'income' ? 'bg-income/10' : 'bg-expense/10'}`}>
          {t.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-income" /> : <ArrowDownLeft className="w-5 h-5 text-expense" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate">{t.category}</p>
            <p className={`font-poppins font-bold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
          {note && (
            <div className="text-sm text-muted-foreground mt-1">
              <span>{note}</span>
              {longNote && (
                <button onClick={() => setExpand((v) => !v)} className="text-primary hover:underline text-xs ml-1">
                  {expand ? 'less' : 'more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(t.id)}
        className="ml-2 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
});
TransactionRow.displayName = 'TransactionRow';

const Manage = () => {
  const { transactions, balance, totals, loading, deleteTransaction, deleteAllTransactions } = useTransactions();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, updating } = useProfile();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ preferred_name: profile?.preferred_name || '' });
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('all');

  const { summaries } = useMonthlySummaries({ startDate: dateRange.from, endDate: dateRange.to });
  const { topCategories } = useCategoryAnalytics({ startDate: dateRange.from, endDate: dateRange.to });

  React.useEffect(() => {
    setProfileForm({ preferred_name: profile?.preferred_name || '' });
  }, [profile]);

  const preferred = profile?.preferred_name || (user?.user_metadata as any)?.preferred_name || '';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const chartData = useMemo(() => {
    const days = 7;
    const keys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      keys.push(`${y}-${m}-${day}`);
    }

    const map = new Map<string, { income: number; expenses: number }>();
    keys.forEach((k) => map.set(k, { income: 0, expenses: 0 }));

    for (const t of transactions) {
      if (!map.has(t.date)) continue;
      const entry = map.get(t.date)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expenses += t.amount;
    }

    return keys.map((k) => {
      const d = new Date(k);
      const { income, expenses } = map.get(k)!;
      return {
        key: k,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        expenses,
      };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let arr = transactions.filter((t) => {
      if (!q) return true;
      return t.category.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q));
    });
    arr.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      return a.category.localeCompare(b.category);
    });
    return arr;
  }, [transactions, searchTerm, sortBy]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Delete this transaction?')) await deleteTransaction(id);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error signing out', description: error.message });
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast({ title: 'No data to export', description: 'Add some transactions first.' });
      return;
    }
    const headers = ['Date', 'Type', 'Category', 'Amount (₵)', 'Note'];
    const csvContent = [
      headers.join(','),
      ...transactions.map((t) =>
        [t.date, t.type, `"${t.category}"`, t.amount.toFixed(2), `"${t.note || ''}"`].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kudimate-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Export successful!', description: 'Your transactions have been downloaded.' });
  };

  const handleDeleteAllData = async () => {
    if (transactions.length === 0) {
      toast({ title: 'No data to delete' });
      return;
    }
    if (confirm('Delete ALL transaction data? This cannot be undone.')) {
      await deleteAllTransactions();
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile({ preferred_name: profileForm.preferred_name || null });
  };

  const overallTrend = useMemo(() => getOverallTrend(summaries), [summaries]);
  const kpis = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const s of summaries) {
      income += Number(s.income);
      expenses += Number(s.expenses);
    }
    return { income, expenses, net: income - expenses, monthsCount: summaries.length };
  }, [summaries]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 space-y-4 animate-pulse">
          <div className="h-28 rounded-xl bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddTransaction={() => setShowAddModal(true)}>
      {/* tabs wrapper */}
      <div className="px-4 pb-4 space-y-6 max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList
            className="sticky md:fixed top-0 md:top-[60px] left-0 w-full z-[60] bg-background/95 backdrop-blur-lg border-b border-border shadow-sm
             -mx-4 md:mx-0 grid grid-cols-4 py-3 md:py-0 md:h-auto h-[64px]"
          >
            <TabsTrigger value="overview" className="flex flex-col items-center gap-1">
              <Wallet className="w-6 h-6" />
              <span className="text-[11px] font-medium text-muted-foreground">Overview</span>
            </TabsTrigger>

            <TabsTrigger value="transactions" className="flex flex-col items-center gap-1">
              <Receipt className="w-6 h-6" />
              <span className="text-[11px] font-medium text-muted-foreground">Transactions</span>
            </TabsTrigger>

            <TabsTrigger value="analytics" className="flex flex-col items-center gap-1">
              <BarChart3 className="w-6 h-6" />
              <span className="text-[11px] font-medium text-muted-foreground">Analytics</span>
            </TabsTrigger>

            <TabsTrigger value="settings" className="flex flex-col items-center gap-1">
              <SettingsIcon className="w-6 h-6" />
              <span className="text-[11px] font-medium text-muted-foreground">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* spacer only for md+ fixed header */}
          <div className="hidden md:block md:h-[100px]" />

          {/* ✅ Overview Tab ONLY */}
          <TabsContent value="overview" className="space-y-6">
            {/* Greeting Section WITHOUT 'Current Balance' */}
            <Card className="shadow-sm border-border/60 bg-gradient-to-br from-background to-muted/30">
              <CardContent className="p-5">
                <h1 className="text-2xl font-poppins font-bold text-foreground">
                  {preferred ? `${greeting}, ${preferred}!` : 'Your Financial Hub'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Track, plan, and achieve your money goals
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full grid place-items-center bg-primary/10 text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Income</p>
                    <p className="text-xl font-poppins font-bold text-income">
                      {formatCurrency(totals.income)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full grid place-items-center bg-expense/10 text-expense">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Expenses</p>
                    <p className="text-xl font-poppins font-bold text-expense">
                      {formatCurrency(totals.expenses)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full grid place-items-center bg-muted">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Net Balance</p>
                    <p className={`text-xl font-poppins font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
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
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add your first transaction
                    </Button>
                  </div>
                ) : (
                  <div>
                    {transactions.slice(0, 5).map((t) => (
                      <TransactionRow key={t.id} t={t} onDelete={handleDeleteTransaction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search category or notes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (newest)</SelectItem>
                  <SelectItem value="amount">Amount (high→low)</SelectItem>
                  <SelectItem value="category">Category (A→Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-3">No transactions found</p>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Transaction
                    </Button>
                  </div>
                ) : (
                  <div>
                    {filteredTransactions.map((t) => (
                      <TransactionRow key={t.id} t={t} onDelete={handleDeleteTransaction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
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
                    {format.format(kpis.net)}
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
                          <p className="text-sm font-bold">{format.format(c.amount)}</p>
                          <p className="text-xs text-muted-foreground">{c.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress value={c.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ✅ Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Profile */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Name</Label>
                  <Input
                    value={profileForm.preferred_name}
                    onChange={(e) => setProfileForm({ preferred_name: e.target.value })}
                    placeholder="How should we call you?"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="py-2 border-b">
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="py-2">
                  <p className="font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">Download all your transactions as CSV</p>
                  </div>
                  <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Delete All Data</p>
                    <p className="text-sm text-muted-foreground">Permanently delete all transactions</p>
                  </div>
                  <Button onClick={handleDeleteAllData} variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Privacy & Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-muted-foreground">View our privacy and data practices</p>
                  </div>
                  <Button onClick={() => setShowPrivacyModal(true)} variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sign Out */}
            <Card className="shadow-md border-destructive/20">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">Sign out of your Kudimate account</p>
                </div>
                <Button onClick={handleSignOut} variant="destructive" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
      <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </Layout>
  );
};

export default Manage;
