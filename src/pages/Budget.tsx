import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowLeft, Copy, PiggyBank, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
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

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthLabel = today.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const monthPrefix = monthKey(today, 0);
  const daysLeft = new Date(year, month, 0).getDate() - today.getDate();
  const previous = {
    month: today.getMonth() === 0 ? 12 : today.getMonth(),
    year: today.getMonth() === 0 ? year - 1 : year,
  };

  const [loading, setLoading] = useState(true);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [savedCategories, setSavedCategories] = useState<SavedCategory[]>([]);

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
    setLoading(false);
  }, [user, month, year, toast]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  // Spending this month per category (matched by name, ignoring case)
  const spentByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.date?.startsWith(monthPrefix)) continue;
      const key = normalise(t.category);
      totals.set(key, (totals.get(key) ?? 0) + Number(t.amount));
    }
    return totals;
  }, [transactions, monthPrefix]);

  const spentFor = (category: string) => spentByCategory.get(normalise(category)) ?? 0;

  // Suggested limit per category: average monthly spend over the last 3 full months
  const suggestions = useMemo(() => {
    const keys = [monthKey(today, 1), monthKey(today, 2), monthKey(today, 3)];
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
  }, [transactions]);

  const totalLimit = savedCategories.reduce((sum, c) => sum + Number(c.limit), 0);
  const totalSpent = savedCategories.reduce((sum, c) => sum + spentFor(c.category), 0);
  const left = totalLimit - totalSpent;

  // ---------- Flow ----------
  const openPreview = (template: Template) => {
    setPreviewTemplate(template);
    setPreviewName(`${monthLabel} budget`);
    setRows(template.rows.map((r) => ({ ...r })));
    setScreen('preview');
  };

  const openCustomise = () => setScreen('builder');

  const openEditSaved = () => {
    setRows(savedCategories.map((c) => ({ category: c.category, note: c.note ?? '', limit: Number(c.limit) })));
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
    if (remaining < 0) return `Over by ${formatMoney(Math.abs(remaining))}. Cut back for the rest of the month.`;
    const percent = Math.round((spent / limit) * 100);
    if (percent >= 80) return `${percent}% used with ${daysLeft} days left. Slow down to stay on track.`;
    return `${formatMoney(remaining)} left with ${daysLeft} days to go.`;
  };

  const hasBudget = !loading && !!budgetId;
  const previewCard = previewTemplate && previewTemplate.id !== 'copy' ? previewTemplate : null;

  return (
    <Layout>
      <div className="px-4 pb-20 md:pb-4 space-y-4 max-w-7xl">

        {/* Header card, same style as the Money page */}
        <Card className="mt-1 md:mt-0 shadow-sm border-border/60 bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-foreground">
                  {screen === 'builder' ? 'Customise budget' : screen === 'preview' ? 'Review budget' : 'Your budget'}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
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

        {/* ---------- Overview with a saved budget ---------- */}
        {hasBudget && screen === 'overview' && (
          <Card className="shadow-sm border-border/60">
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

              <div className="space-y-5">
                {savedCategories.map((c) => {
                  const spent = spentFor(c.category);
                  const limit = Number(c.limit);
                  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{c.category}</p>
                          {c.note && <p className="text-xs text-muted-foreground truncate">{c.note}</p>}
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">
                          {formatMoney(spent)} <span className="text-muted-foreground">/ {formatMoney(limit)}</span>
                        </p>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full transition-all ${barColor(percent)}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>
                      <p className={`text-xs ${spent > limit ? 'text-expense font-medium' : 'text-muted-foreground'}`}>
                        {statusLine(spent, limit)}
                      </p>
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

            <Button variant="outline" size="sm" onClick={copyLastMonth} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" /> Copy last month instead
            </Button>
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
                <button type="button" onClick={backToOverview} className="text-muted-foreground hover:text-foreground" aria-label="Back">
                  <ArrowLeft className="w-4 h-4" />
                </button>
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
                  disabled={saving || rows.length === 0}
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

              <div className="space-y-3">
                {rows.map((row, index) => {
                  const suggested = suggestions.get(normalise(row.category));
                  return (
                    <div key={index} className="rounded-xl border border-border/60 p-3 space-y-2.5 bg-card">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category {index + 1}</p>
                        <Button variant="ghost" size="sm" onClick={() => removeRow(index)} aria-label="Remove category" className="h-7 px-2 text-expense gap-1">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-40">
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
                        <span className="text-xs text-muted-foreground">per month</span>
                        {suggested !== undefined && suggested !== row.limit && (
                          <button
                            type="button"
                            onClick={() => updateRow(index, { limit: suggested })}
                            className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                          >
                            Use {formatMoney(suggested)} (your 3-month average)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add category
                </Button>
                <p className="text-sm font-merriweather font-semibold">Total: {formatMoney(rowTotal)}</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button variant="outline" onClick={() => setScreen(budgetId ? 'overview' : 'preview')} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={saveBudget} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary-dark">
                  {saving ? 'Saving...' : budgetId ? 'Save changes' : 'Save budget'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Budget;
