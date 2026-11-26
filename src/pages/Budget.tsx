import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowDownLeft, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Copy, PiggyBank, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Row = { category: string; note: string; limit: number };
type SavedCategory = { id: string; category: string; note: string | null; limit: number };
type Template = {
  id: string;
  label: string;
  description: string;
  // Background photo for the carousel card. Leave null to show the colour fallback.
  image: string | null;
  gradient: string;
  rows: Row[];
};

// Starter categories. Users can rename, edit or remove any of them.
const TEMPLATES: Template[] = [
  {
    id: 'student',
    label: 'Student',
    description: 'Campus food, transport, data and school costs',
    image: null,
    gradient: 'from-primary-dark to-accent',
    rows: [
      { category: 'Food & canteen', note: 'Meals on campus and snacks', limit: 400 },
      { category: 'Transport', note: 'Trotro, bus or bolt to school', limit: 150 },
      { category: 'Data & airtime', note: 'Internet bundles and calls', limit: 100 },
      { category: 'School supplies', note: 'Books, printing, stationery', limit: 120 },
      { category: 'Fun', note: 'Outings and treats', limit: 100 },
    ],
  },
  {
    id: 'worker',
    label: 'Worker',
    description: 'Rent, bills, food and getting to work',
    image: null,
    gradient: 'from-income to-income-light',
    rows: [
      { category: 'Rent', note: 'Monthly rent or room', limit: 1200 },
      { category: 'Groceries', note: 'Food for the house', limit: 700 },
      { category: 'Bills', note: 'Power, water, internet', limit: 400 },
      { category: 'Transport', note: 'Daily commute to work', limit: 350 },
      { category: 'Savings', note: 'Moved to savings each month', limit: 500 },
    ],
  },
  {
    id: 'family',
    label: 'Family',
    description: 'Household costs, school fees and savings',
    image: null,
    gradient: 'from-expense to-primary',
    rows: [
      { category: 'Groceries', note: 'Food for everyone', limit: 900 },
      { category: 'Bills', note: 'Power, water, internet', limit: 500 },
      { category: 'School fees', note: 'Fees and uniforms', limit: 600 },
      { category: 'Transport', note: 'Family transport', limit: 300 },
      { category: 'Savings', note: 'Emergency fund', limit: 400 },
    ],
  },
  {
    id: 'blank',
    label: 'Start blank',
    description: 'Build every category yourself',
    image: null,
    gradient: 'from-slate-600 to-slate-800',
    rows: [],
  },
];

const formatMoney = (n: number) =>
  `GH₵ ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const barColor = (percent: number) =>
  percent > 100 ? 'bg-expense' : percent >= 80 ? 'bg-accent' : 'bg-income';

// 'YYYY-MM' for the month `offset` months before `base`
const monthKey = (base: Date, offset: number) => {
  const d = new Date(base.getFullYear(), base.getMonth() - offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const normalise = (s: string) => s.trim().toLowerCase();

// Photo-style card, same shape as the carousel on the Money page
const TemplateCard = ({ template, onClick }: { template: Template; onClick: () => void }) => {
  const total = template.rows.reduce((s, r) => s + r.limit, 0);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative min-w-[280px] md:min-w-[320px] h-40 md:h-48 rounded-2xl overflow-hidden text-left cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`} />
      {template.image && (
        <img
          src={template.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3 className="text-white font-bold text-lg md:text-xl leading-tight">{template.label}</h3>
        <p className="text-white/80 text-xs md:text-sm mt-1 line-clamp-2">{template.description}</p>
        <p className="text-white/90 text-xs md:text-sm mt-2 font-merriweather font-semibold">
          {template.rows.length > 0 ? `${formatMoney(total)} a month` : 'Build your own'}
        </p>
      </div>
    </motion.button>
  );
};

const Budget = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { toast } = useToast();

  // Month switcher: 0 is the current month, negative numbers go back
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const selected = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const month = selected.getMonth() + 1;
  const year = selected.getFullYear();
  const isCurrent = monthOffset === 0;
  const monthLabel = selected.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const monthPrefix = monthKey(selected, 0);
  const lastDay = new Date(year, month, 0).getDate();
  const daysLeft = isCurrent ? lastDay - today.getDate() : 0;
  const previous = {
    month: month === 1 ? 12 : month - 1,
    year: month === 1 ? year - 1 : year,
  };

  const [loading, setLoading] = useState(true);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [savedCategories, setSavedCategories] = useState<SavedCategory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Screen flow: 'overview' (saved budget or template picker) → 'preview' → 'builder'
  const [screen, setScreen] = useState<'overview' | 'preview' | 'builder'>('overview');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  const loadBudget = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: budget, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('period_type', 'monthly')
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (error) {
      toast({ title: 'Could not load your budget', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (budget) {
      const { data: categories } = await supabase
        .from('budget_categories')
        .select('id, category, note, limit')
        .eq('budget_id', budget.id);
      setSavedCategories((categories ?? []) as SavedCategory[]);
      setBudgetId(budget.id);
    } else {
      setSavedCategories([]);
      setBudgetId(null);
    }
    setExpandedId(null);
    setLoading(false);
  }, [user, month, year, toast]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  // Expenses in the selected month
  const expenseThisMonth = useMemo(
    () => transactions.filter((t) => t.type === 'expense' && t.date?.startsWith(monthPrefix)),
    [transactions, monthPrefix],
  );

  // Spending per category (matched by name, ignoring case)
  const spentByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of expenseThisMonth) {
      const key = normalise(t.category);
      totals.set(key, (totals.get(key) ?? 0) + Number(t.amount));
    }
    return totals;
  }, [expenseThisMonth]);

  const spentFor = (category: string) => spentByCategory.get(normalise(category)) ?? 0;

  // Suggested limit per category: average monthly spend over the 3 months before the selected one
  const suggestions = useMemo(() => {
    const keys = [monthKey(selected, 1), monthKey(selected, 2), monthKey(selected, 3)];
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.date) continue;
      if (!keys.some((k) => t.date.startsWith(k))) continue;
      const key = normalise(t.category);
      totals.set(key, (totals.get(key) ?? 0) + Number(t.amount));
    }
    const averages = new Map<string, number>();
    totals.forEach((sum, key) => averages.set(key, Math.round(sum / 3)));
    return averages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, monthOffset]);

  // Categories spent on this month that have no limit yet
  const unbudgeted = useMemo(() => {
    const budgeted = new Set(savedCategories.map((c) => normalise(c.category)));
    const found = new Map<string, { name: string; total: number }>();
    for (const t of expenseThisMonth) {
      const key = normalise(t.category);
      if (budgeted.has(key)) continue;
      const existing = found.get(key);
      if (existing) existing.total += Number(t.amount);
      else found.set(key, { name: t.category.trim(), total: Number(t.amount) });
    }
    return Array.from(found.values()).sort((a, b) => b.total - a.total);
  }, [expenseThisMonth, savedCategories]);

  const totalLimit = savedCategories.reduce((sum, c) => sum + Number(c.limit), 0);
  const totalSpent = savedCategories.reduce((sum, c) => sum + spentFor(c.category), 0);
  const left = totalLimit - totalSpent;

  const overCategories = savedCategories.filter((c) => Number(c.limit) > 0 && spentFor(c.category) > Number(c.limit));
  const nearCategories = savedCategories.filter((c) => {
    const limit = Number(c.limit);
    if (limit <= 0 || spentFor(c.category) > limit) return false;
    return spentFor(c.category) / limit >= 0.8;
  });

  // One-line health summary for the top of the page
  const healthLine = () => {
    if (overCategories.length > 0) {
      return `${overCategories.length} over the limit and ${nearCategories.length} close to it. Tap the warning below to see them.`;
    }
    if (nearCategories.length > 0) {
      return `${nearCategories.length} close to the limit. The rest are comfortably under.`;
    }
    return 'On track. Every category is under 80% used.';
  };

  // ---------- Flow ----------
  const openPreview = (template: Template) => {
    setPreviewTemplate(template);
    setPreviewName(`${monthLabel} budget`);
    setRows(template.rows.map((r) => ({ ...r })));
    setScreen('preview');
  };

  const openCustomise = () => {
    // Never open the builder empty: start with one blank row to fill in
    setRows((prev) => (prev.length > 0 ? prev : [{ category: '', note: '', limit: 0 }]));
    setScreen('builder');
  };

  const openEditSaved = () => {
    setRows(savedCategories.map((c) => ({ category: c.category, note: c.note ?? '', limit: Number(c.limit) })));
    setScreen('builder');
  };

  // Plus button: add a category to a saved budget, or start a blank one if there is none
  const openAddCategory = () => {
    if (budgetId) {
      setRows([
        ...savedCategories.map((c) => ({ category: c.category, note: c.note ?? '', limit: Number(c.limit) })),
        { category: '', note: '', limit: 0 },
      ]);
      setScreen('builder');
    } else {
      openPreview(TEMPLATES[TEMPLATES.length - 1]);
    }
  };

  // Quick add: set up the spending categories that have no limit yet
  const openAddUnbudgeted = () => {
    setRows([
      ...savedCategories.map((c) => ({ category: c.category, note: c.note ?? '', limit: Number(c.limit) })),
      ...unbudgeted.map((u) => ({ category: u.name, note: '', limit: suggestions.get(normalise(u.name)) ?? 0 })),
    ]);
    setScreen('builder');
  };

  const copyLastMonth = async () => {
    if (!user) return;
    const { data: last, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('period_type', 'monthly')
      .eq('month', previous.month)
      .eq('year', previous.year)
      .maybeSingle();

    if (error) {
      toast({ title: 'Could not load last month', description: error.message, variant: 'destructive' });
      return;
    }
    if (!last) {
      toast({ title: 'No budget found for last month' });
      return;
    }
    const { data: categories } = await supabase
      .from('budget_categories')
      .select('id, category, note, limit')
      .eq('budget_id', last.id);
    setPreviewTemplate({
      id: 'copy',
      label: 'Last month',
      description: 'Copied from last month. Change anything you like.',
      image: null,
      gradient: 'from-income to-primary',
      rows: [],
    });
    setPreviewName(`${monthLabel} budget`);
    setRows(
      ((categories ?? []) as SavedCategory[]).map((c) => ({
        category: c.category,
        note: c.note ?? '',
        limit: Number(c.limit),
      })),
    );
    setScreen('preview');
  };

  const backToOverview = () => {
    setScreen('overview');
    setRows([]);
    setPreviewTemplate(null);
  };

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---------- Builder helpers ----------
  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));
  const addRow = () => setRows((prev) => [...prev, { category: '', note: '', limit: 0 }]);

  const rowTotal = rows.reduce((s, r) => s + (Number(r.limit) || 0), 0);

  // ---------- Save ----------
  const saveBudget = async () => {
    if (!user) return;
    const cleaned = rows
      .map((r) => ({ category: r.category.trim(), note: r.note.trim(), limit: Number(r.limit) || 0 }))
      .filter((r) => r.category.length > 0);

    if (cleaned.length === 0) {
      toast({ title: 'Add at least one category', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const total = cleaned.reduce((sum, r) => sum + r.limit, 0);

    if (budgetId) {
      // Editing: update the total, then replace the categories
      const { error: updateError } = await supabase.from('budgets').update({ total_limit: total }).eq('id', budgetId);
      if (updateError) {
        setSaving(false);
        toast({ title: 'Could not update budget', description: updateError.message, variant: 'destructive' });
        return;
      }
      await supabase.from('budget_categories').delete().eq('budget_id', budgetId);
      const { error: categoryError } = await supabase
        .from('budget_categories')
        .insert(cleaned.map((r) => ({ budget_id: budgetId, category: r.category, note: r.note || null, limit: r.limit })));
      setSaving(false);
      if (categoryError) {
        toast({ title: 'Could not save categories', description: categoryError.message, variant: 'destructive' });
        return;
      }
    } else {
      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          name: previewName.trim() || `${monthLabel} budget`,
          period_type: 'monthly',
          month,
          year,
          total_limit: total,
        })
        .select('id')
        .single();

      if (error || !budget) {
        setSaving(false);
        toast({ title: 'Could not save budget', description: error?.message, variant: 'destructive' });
        return;
      }

      const { error: categoryError } = await supabase
        .from('budget_categories')
        .insert(cleaned.map((r) => ({ budget_id: budget.id, category: r.category, note: r.note || null, limit: r.limit })));

      if (categoryError) {
        // Roll back so a half-saved budget does not stick around
        await supabase.from('budgets').delete().eq('id', budget.id);
        setSaving(false);
        toast({ title: 'Could not save categories', description: categoryError.message, variant: 'destructive' });
        return;
      }
      setSaving(false);
    }

    setScreen('overview');
    setRows([]);
    setPreviewTemplate(null);
    toast({ title: 'Budget saved' });
    loadBudget();
  };

  const deleteBudget = async () => {
    if (!budgetId) return;
    if (!window.confirm(`Delete your ${monthLabel} budget? Your transactions are not affected.`)) return;
    await supabase.from('budget_categories').delete().eq('budget_id', budgetId);
    await supabase.from('budgets').delete().eq('id', budgetId);
    toast({ title: 'Budget deleted' });
    loadBudget();
  };

  // Plain-language status for one category
  const statusLine = (spent: number, limit: number) => {
    const remaining = limit - spent;
    if (limit <= 0) return 'No limit set';
    if (remaining < 0) {
      return isCurrent
        ? `Over by ${formatMoney(Math.abs(remaining))}. Cut back for the rest of the month.`
        : `Over by ${formatMoney(Math.abs(remaining))} this month.`;
    }
    if (!isCurrent) return `${formatMoney(remaining)} left at the end of the month.`;
    const percent = Math.round((spent / limit) * 100);
    if (percent >= 80) return `${percent}% used with ${daysLeft} days left. Slow down to stay on track.`;
    return `${formatMoney(remaining)} left with ${daysLeft} days to go.`;
  };

  // Expense transactions for one category this month, newest first
  const transactionsFor = (category: string) =>
    expenseThisMonth
      .filter((t) => normalise(t.category) === normalise(category))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

  const hasBudget = !loading && !!budgetId;
  const previewCard = previewTemplate && previewTemplate.id !== 'copy' ? previewTemplate : null;

  return (
    <Layout>
      <div className="px-4 pb-24 md:pb-4 space-y-4 max-w-7xl">

        {/* Header card with month switcher, same style as the Money page */}
        <Card className="mt-1 md:mt-0 shadow-sm border-border/60 bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-foreground">
                  {screen === 'builder' ? 'Customise budget' : screen === 'preview' ? 'Review budget' : 'Your budget'}
                </h1>
                {screen === 'overview' ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setMonthOffset((o) => o - 1)}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="text-xs md:text-sm text-muted-foreground min-w-[9rem] text-center">{monthLabel}</p>
                    <button
                      type="button"
                      onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
                      disabled={isCurrent}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    {screen === 'builder' && previewTemplate && previewTemplate.id !== 'copy'
                      ? `Based on ${previewTemplate.label} · ${monthLabel}`
                      : monthLabel}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full grid place-items-center bg-primary/15 text-primary shrink-0">
                <PiggyBank className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && <p className="text-sm text-muted-foreground px-1">Loading your budget...</p>}

        {/* Summary stats: only when a budget is saved */}
        {hasBudget && screen === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-muted shrink-0">
                  <PiggyBank className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Budgeted</p>
                  <p className="text-sm md:text-xl font-merriweather font-bold truncate">{formatMoney(totalLimit)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-expense/10 text-expense shrink-0">
                  <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Spent</p>
                  <p className="text-sm md:text-xl font-merriweather font-bold text-expense truncate">{formatMoney(totalSpent)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm col-span-2 md:col-span-1">
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center bg-income/10 text-income shrink-0">
                  <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">
                    {left >= 0 ? 'Left to spend' : 'Over budget'}
                  </p>
                  <p className={`text-sm md:text-xl font-merriweather font-bold truncate ${left >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatMoney(Math.abs(left))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Health line and warnings: only when a budget is saved */}
        {hasBudget && screen === 'overview' && savedCategories.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground px-1">{healthLine()}</p>

            {overCategories.length > 0 && (
              <button
                type="button"
                onClick={scrollToCategories}
                className="w-full flex items-center gap-3 rounded-2xl border border-expense/30 bg-expense/5 p-3 text-left hover:bg-expense/10"
              >
                <AlertTriangle className="w-4 h-4 text-expense shrink-0" />
                <span className="text-sm">
                  <span className="font-semibold text-expense">Over budget:</span>{' '}
                  {overCategories.map((c) => c.category).join(', ')}
                </span>
              </button>
            )}
          </>
        )}

        {/* Quick add: spending with no limit yet */}
        {hasBudget && screen === 'overview' && unbudgeted.length > 0 && (
          <Card className="shadow-sm border-accent/40">
            <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm">You spent on {unbudgeted.length} {unbudgeted.length === 1 ? 'category' : 'categories'} with no limit</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {unbudgeted.map((u) => `${u.name} (${formatMoney(u.total)})`).join(', ')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={openAddUnbudgeted} className="gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" /> Set limits
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ---------- Overview with a saved budget ---------- */}
        {hasBudget && screen === 'overview' && (
          <Card id="categories" className="shadow-sm border-border/60 scroll-mt-20">
            <CardContent className="p-4 md:p-5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">Categories</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={openEditSaved} className="gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={deleteBudget} className="gap-1.5 text-expense">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {savedCategories.map((c) => {
                  const spent = spentFor(c.category);
                  const limit = Number(c.limit);
                  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                  const open = expandedId === c.id;
                  const list = open ? transactionsFor(c.category) : [];
                  return (
                    <div key={c.id} className="rounded-xl border border-border/60">
                      <button
                        type="button"
                        onClick={() => setExpandedId(open ? null : c.id)}
                        aria-expanded={open}
                        className="w-full p-3 space-y-1.5 text-left"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{c.category}</p>
                            {c.note && <p className="text-xs text-muted-foreground truncate">{c.note}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <p className="text-sm font-medium whitespace-nowrap">
                              {formatMoney(spent)} <span className="text-muted-foreground">/ {formatMoney(limit)}</span>
                            </p>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full transition-all ${barColor(percent)}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                        </div>
                        <p className={`text-xs ${spent > limit ? 'text-expense font-medium' : 'text-muted-foreground'}`}>
                          {statusLine(spent, limit)}
                        </p>
                      </button>

                      {open && (
                        <div className="border-t border-border/60 px-3 py-2 space-y-1.5">
                          {list.length === 0 && <p className="text-xs text-muted-foreground py-1">No spending in this category yet.</p>}
                          {list.map((t) => (
                            <div key={t.id} className="flex justify-between gap-3 text-xs py-1">
                              <div className="min-w-0">
                                <p className="truncate">{t.note || 'Expense'}</p>
                                <p className="text-muted-foreground">{t.date}</p>
                              </div>
                              <p className="font-merriweather font-semibold whitespace-nowrap">{formatMoney(Number(t.amount))}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------- Overview with no budget: pick a template from the carousel ---------- */}
        {!loading && !budgetId && screen === 'overview' && (
          <>
            <Card className="shadow-sm border-border/60">
              <CardContent className="p-4 md:p-5">
                <p className="font-semibold">You have no budget for {monthLabel} yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Swipe to choose a starting point. You'll see what it includes before anything is saved.
                </p>
              </CardContent>
            </Card>

            <div className="w-full overflow-x-auto pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <div className="flex gap-4 w-max">
                {TEMPLATES.map((t) => (
                  <TemplateCard key={t.id} template={t} onClick={() => openPreview(t)} />
                ))}
              </div>
            </div>

            {isCurrent && (
              <Button variant="outline" size="sm" onClick={copyLastMonth} className="gap-1.5">
                <Copy className="w-3.5 h-3.5" /> Copy last month instead
              </Button>
            )}
          </>
        )}

        {/* ---------- Preview: name it and see what is included ---------- */}
        {!loading && screen === 'preview' && (
          <Card className="shadow-sm border-border/60 overflow-hidden">
            {previewCard && (
              <div className="relative h-28 md:h-32">
                <div className={`absolute inset-0 bg-gradient-to-br ${previewCard.gradient}`} />
                {previewCard.image && <img src={previewCard.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-3 left-4 text-white font-bold text-lg">{previewCard.label}</p>
              </div>
            )}
            <CardContent className="p-4 md:p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={backToOverview} className="gap-1.5" aria-label="Back to budget">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <p className="text-sm text-muted-foreground">
                  Starting from: <span className="font-semibold text-foreground">{previewTemplate?.label}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="budget-name" className="text-sm font-semibold">Name this budget</label>
                <Input id="budget-name" value={previewName} onChange={(e) => setPreviewName(e.target.value)} placeholder="e.g. November budget" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">What's included</p>
                <div className="divide-y divide-border/60 rounded-xl border border-border/60">
                  {rows.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">No categories yet. Customise to add some.</p>
                  )}
                  {rows.map((r, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.category || 'Untitled'}</p>
                        {r.note && <p className="text-xs text-muted-foreground truncate">{r.note}</p>}
                      </div>
                      <p className="text-sm font-merriweather font-semibold whitespace-nowrap">{formatMoney(Number(r.limit) || 0)}</p>
                    </div>
                  ))}
                  {rows.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-b-xl">
                      <p className="text-sm font-semibold">Total</p>
                      <p className="text-sm font-merriweather font-bold">{formatMoney(rowTotal)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                <Button variant="outline" onClick={openCustomise} className="gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Customise
                </Button>
                <Button
                  onClick={saveBudget}
                  disabled={saving || rows.every((r) => !r.category.trim())}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark"
                >
                  {saving ? 'Saving...' : 'Create budget'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------- Builder: one category per card ---------- */}
        {!loading && screen === 'builder' && (
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-4 md:p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Name each category and say briefly what it is for. The limit is the most you plan to spend.
              </p>

              {/* One compact row per category: name, what it is for, limit, remove */}
              <div className="divide-y divide-border/60 rounded-xl border border-border/60">
                {rows.map((row, index) => {
                  const suggested = suggestions.get(normalise(row.category));
                  return (
                    <div key={index} className="p-3 space-y-1.5">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_9rem_auto] gap-2 items-center">
                        <Input
                          value={row.category}
                          placeholder="Category name, e.g. Transport"
                          aria-label="Category name"
                          onChange={(e) => updateRow(index, { category: e.target.value })}
                        />
                        <Input
                          value={row.note}
                          placeholder="What is it for?"
                          aria-label="What it is for"
                          onChange={(e) => updateRow(index, { note: e.target.value })}
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">GH₵</span>
                          <Input
                            type="number"
                            min={0}
                            value={row.limit}
                            aria-label="Monthly limit"
                            className="pl-11"
                            onChange={(e) => updateRow(index, { limit: Number(e.target.value) })}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          aria-label="Remove category"
                          className="h-9 w-9 justify-self-end md:justify-self-center grid place-items-center rounded-md text-muted-foreground hover:text-expense hover:bg-expense/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {suggested !== undefined && suggested !== row.limit && (
                        <button
                          type="button"
                          onClick={() => updateRow(index, { limit: suggested })}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Use {formatMoney(suggested)} (your 3-month average)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add category
                </Button>
              </div>

              {/* Sticky total and actions, so the running total is always visible */}
              <div className="sticky bottom-20 md:bottom-4 z-30 pt-2">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/95 backdrop-blur p-3 shadow-md">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total per month</p>
                    <p className="text-sm font-merriweather font-bold truncate">{formatMoney(rowTotal)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => setScreen(budgetId ? 'overview' : 'preview')} disabled={saving}>
                      Cancel
                    </Button>
                    <Button
                      onClick={saveBudget}
                      disabled={saving || rows.every((r) => !r.category.trim())}
                      className="bg-primary text-primary-foreground hover:bg-primary-dark"
                    >
                      {saving ? 'Saving...' : budgetId ? 'Save changes' : 'Save budget'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plus button: floats above the mobile bottom bar */}
        {!loading && screen === 'overview' && (
          <button
            type="button"
            onClick={openAddCategory}
            aria-label={budgetId ? 'Add category' : 'Start a budget'}
            className="fixed right-4 bottom-20 md:bottom-8 z-40 w-14 h-14 rounded-full grid place-items-center bg-primary text-primary-foreground shadow-lg hover:bg-primary-dark active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>
    </Layout>
  );
};

export default Budget;
