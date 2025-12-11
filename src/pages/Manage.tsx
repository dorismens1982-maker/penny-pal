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
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { DateRange } from '@/components/DateRangePicker';
import { getOverallTrend } from '@/utils/trendCalculations';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { useMonthlyRecap } from '@/hooks/useMonthlyRecap';
import { MonthlyRecapModal } from '@/components/manage/MonthlyRecapModal';
import { VibeCarousel } from '@/components/manage/VibeCarousel';
import { OverviewTab } from '@/components/manage/OverviewTab';
import { TransactionsTab } from '@/components/manage/TransactionsTab';
import { AnalyticsTab } from '@/components/manage/AnalyticsTab';
import { SettingsTab } from '@/components/manage/SettingsTab';

import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedPreset, setSelectedPreset] = useState<any>('all');

  const { summaries } = useMonthlySummaries({ startDate: dateRange.from, endDate: dateRange.to });
  const { topCategories } = useCategoryAnalytics({ startDate: dateRange.from, endDate: dateRange.to });
  const { showRecap, recapData, closeRecap, manuallyTriggerRecap } = useMonthlyRecap();

  // --- Mascot State ---
  const [showQuote, setShowQuote] = useState(true);
  const quotes = [
    "Every penny counts! 🌟",
    "You're the boss of your wallet! 👔",
    "Small steps, big goals! 💰",
    "Budgeting is self-care! 💆‍♂️",
    "Keep that streak alive! 🔥",
    "Money moves only! 🚀"
  ];
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  // Initial greeting timer
  React.useEffect(() => {
    const timer = setTimeout(() => setShowQuote(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleMascotClick = () => {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(random);
    setShowQuote(true);
    setTimeout(() => setShowQuote(false), 3000);
  };
  // --------------------

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

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const counts = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) t.type === 'income' ? income++ : expense++;
    return { all: transactions.length, income, expense };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let arr = transactions.filter((t) => {
      const matchesType = filterType === 'all' || t.type === filterType;
      if (!matchesType) return false;

      if (!q) return true;
      return t.category.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q));
    });
    arr.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      return a.category.localeCompare(b.category);
    });
    return arr;
  }, [transactions, searchTerm, sortBy, filterType]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Delete this transaction?')) await deleteTransaction(id);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSearchParams({ tab: 'overview' });
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
      <div className="px-4 pb-20 md:pb-4 space-y-4 max-w-7xl">

        {/* Greeting */}
        {tab === 'overview' && (
          <>
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

                  {/* Mascot in Greeting Card */}
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }}
                      onClick={handleMascotClick}
                      className="cursor-pointer relative z-10"
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white shadow-md border-2 border-white ring-2 ring-yellow-400/50 p-0.5 flex items-center justify-center overflow-hidden">
                        <img src="/penny_avatar.png" alt="Mascot" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-0.5 border border-white">
                        <Sparkles className="w-2 h-2 text-white fill-white" />
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {showQuote && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-popover px-3 py-2 rounded-xl shadow-xl border border-border/50 text-xs font-medium text-center min-w-[140px] max-w-[200px] z-20 text-popover-foreground whitespace-normal"
                        >
                          {currentQuote}
                          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-popover rotate-45 border-t border-r border-border/50" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

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
            <div className="mt-2 mb-6">
              <VibeCarousel />
            </div>
            <OverviewTab
              totals={totals}
              balance={balance}
              chartData={chartData}
              transactions={transactions}
              onAddTransaction={() => setShowAddModal(true)}
              onDeleteTransaction={handleDeleteTransaction}
              onViewIncome={() => {
                setTab('transactions');
                setFilterType('income');
              }}
              onViewExpenses={() => {
                setTab('transactions');
                setFilterType('expense');
              }}
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
              filterType={filterType}
              setFilterType={setFilterType}
              counts={counts}
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
              onPreviewRecap={manuallyTriggerRecap}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
      <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
      <MonthlyRecapModal open={showRecap} onClose={closeRecap} data={recapData} />
    </Layout>
  );
};

export default Manage;
