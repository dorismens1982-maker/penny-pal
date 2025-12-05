import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import {
  Wallet,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { DateRange } from '@/components/DateRangePicker';
import { getOverallTrend } from '@/utils/trendCalculations';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

import { OverviewTab } from '@/components/manage/OverviewTab';
import { TransactionsTab } from '@/components/manage/TransactionsTab';
import { AnalyticsTab } from '@/components/manage/AnalyticsTab';
import { SettingsTab } from '@/components/manage/SettingsTab';

import { useSearchParams } from 'react-router-dom';

const Manage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as 'overview' | 'transactions' | 'analytics' | 'settings') || 'overview';

  const setTab = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

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
  const [selectedPreset, setSelectedPreset] = useState<any>('all'); // Type explicit or any if not exported

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
    link.setAttribute('download', `penny-pal-transactions-${new Date().toISOString().split('T')[0]}.csv`);
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
      <div className="px-4 pb-20 md:pb-4 space-y-4 max-w-7xl mx-auto">
        {/* Greeting */}
        {tab === 'overview' && (
          <Card className="mt-1 md:mt-0 shadow-sm border-border/60 bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg md:text-2xl font-poppins font-bold text-foreground">
                    {preferred ? `${greeting}, ${preferred}!` : 'Your Financial Hub'}
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Track, plan, and achieve your money goals
                  </p>
                </div>
                <Button
                  aria-label="Open Settings"
                  variant="outline"
                  size="icon"
                  onClick={() => setTab('settings')}
                  className="shrink-0 w-8 h-8 md:w-9 md:h-9"
                >
                  <SettingsIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 
           Mobile: TabsList is hidden because we use the global Bottom Nav (in Layout).
           Desktop: TabsList is visible.
        */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="hidden md:grid sticky top-[60px] left-0 w-full z-[60] bg-background/95 backdrop-blur-lg border-b border-border shadow-sm grid-cols-4 gap-1 px-0 py-0 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3">
              <Wallet className="w-4 h-4 mr-2" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3">
              <Receipt className="w-4 h-4 mr-2" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-3">
              <SettingsIcon className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>


          <TabsContent value="overview">
            <OverviewTab
              totals={totals}
              balance={balance}
              chartData={chartData}
              transactions={transactions}
              onAddTransaction={() => setShowAddModal(true)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filteredTransactions={filteredTransactions}
              onAddTransaction={() => setShowAddModal(true)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedPreset={selectedPreset}
              setSelectedPreset={setSelectedPreset}
              kpis={kpis}
              overallTrend={overallTrend}
              topCategories={topCategories}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              handleSaveProfile={handleSaveProfile}
              updating={updating}
              user={user}
              handleExportCSV={handleExportCSV}
              handleDeleteAllData={handleDeleteAllData}
              setShowPrivacyModal={setShowPrivacyModal}
              handleSignOut={handleSignOut}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
      <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </Layout>
  );
};

export default Manage;
