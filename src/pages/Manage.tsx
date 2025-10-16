import React, { useState, useMemo, memo, useEffect } from 'react';
import Layout  from '@/components/Layout';
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
  Calendar,
  Minus,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useMonthlySummaries } from '@/hooks/useMonthlySummaries';
import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics';
import { DateRangePicker, DateRange, DateRangePreset } from '@/components/DateRangePicker';
import { getOverallTrend, getMonthTrend } from '@/utils/trendCalculations';
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
          <p className="text-xs text-muted-foreground">
            {new Date(t.date).toLocaleDateString()}
          </p>
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
  const { user, signOut, profile: authProfile } = useAuth();
  const { profile, updateProfile, updating } = useProfile();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ preferred_name: profile?.preferred_name || '' });
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('all');
  const [scrolled, setScrolled] = useState(false);

  const { summaries, getMonthName } = useMonthlySummaries({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const { topCategories } = useCategoryAnalytics({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  // Detect scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Chart data for cashflow
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

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

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
      <div className="p-4 space-y-6 max-w-7xl mx-auto">

        {/* Sticky Header Tabs */}
        <div className={`sticky top-0 z-30 bg-background/80 backdrop-blur-md pb-2 transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="flex justify-around border-b border-border bg-transparent">
              <TabsTrigger value="overview" className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-sm font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm font-medium flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Greeting */}
        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-background to-muted/30 mt-2">
          <CardContent className="p-5">
            <h1 className="text-2xl font-poppins font-bold text-foreground">
              {preferred ? `${greeting}, ${preferred}!` : 'Your Financial Hub'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track, plan, and achieve your money goals</p>
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

        {/* Tabs Content Section (unchanged) */}
        <Tabs defaultValue="overview" className="w-full">
          {/* ... existing TabsList and TabsContent remain unchanged ... */}
        </Tabs>
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
      <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </Layout>
  );
};

export default Manage;
