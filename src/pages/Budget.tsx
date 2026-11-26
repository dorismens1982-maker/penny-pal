import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Row = { category: string; note: string; limit: number };
type SavedCategory = { id: string; category: string; note: string | null; limit: number };
type Template = { id: string; label: string; description: string; rows: Row[] };

// Starter categories. Users can rename, edit or remove any of them.
const TEMPLATES: Template[] = [
  {
    id: 'student',
    label: 'Student',
    description: 'Campus food, transport, data and school costs',
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
    rows: [],
  },
];

const formatMoney = (n: number) =>
  `GH₵ ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const barColor = (percent: number) =>
  percent > 100 ? 'bg-expense' : percent >= 80 ? 'bg-accent' : 'bg-income';

const Budget = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { toast } = useToast();

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthLabel = today.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const [loading, setLoading] = useState(true);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [savedCategories, setSavedCategories] = useState<SavedCategory[]>([]);
  const [creating, setCreating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
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
      const key = t.category.trim().toLowerCase();
      totals.set(key, (totals.get(key) ?? 0) + Number(t.amount));
    }
    return totals;
  }, [transactions, monthPrefix]);

  const spentFor = (category: string) => spentByCategory.get(category.trim().toLowerCase()) ?? 0;

  const totalLimit = savedCategories.reduce((sum, c) => sum + Number(c.limit), 0);
  const totalSpent = savedCategories.reduce((sum, c) => sum + spentFor(c.category), 0);

  const startCreate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setActiveTemplate(templateId);
    setRows(template.rows.map((r) => ({ ...r })));
    setCreating(true);
  };

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const addRow = () => setRows((prev) => [...prev, { category: '', note: '', limit: 0 }]);

  const saveBudget = async () => {
    if (!user) return;
    const cleaned = rows
      .map((r) => ({ ...r, category: r.category.trim(), note: r.note.trim() }))
      .filter((r) => r.category.length > 0);

    if (cleaned.length === 0) {
      toast({ title: 'Add at least one category', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const total = cleaned.reduce((sum, r) => sum + Number(r.limit || 0), 0);

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        name: `${monthLabel} budget`,
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

    const { error: categoryError } = await supabase.from('budget_categories').insert(
      cleaned.map((r) => ({
        budget_id: budget.id,
        category: r.category,
        note: r.note || null,
        limit: Number(r.limit) || 0,
      })),
    );

    if (categoryError) {
      // Roll back the budget row so a half-saved budget does not stick around
      await supabase.from('budgets').delete().eq('id', budget.id);
      setSaving(false);
      toast({ title: 'Could not save categories', description: categoryError.message, variant: 'destructive' });
      return;
    }

    setSaving(false);
    setCreating(false);
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

  const TemplateChips = (
    <div className="flex flex-wrap gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => startCreate(t.id)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${activeTemplate === t.id && creating
              ? 'bg-primary text-primary-foreground border-primary font-semibold'
              : 'bg-card border-border text-foreground hover:bg-muted'
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-6 pb-24 md:pb-10 max-w-3xl space-y-5">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-foreground">Budget</h1>
          <p className="text-sm text-muted-foreground">{monthLabel}</p>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading your budget...</p>}

        {/* ---------- Existing budget: progress view ---------- */}
        {!loading && budgetId && !creating && (
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-5 space-y-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Spent so far</p>
                  <p className="font-poppins text-2xl font-bold">
                    {formatMoney(totalSpent)}
                    <span className="text-base font-medium text-muted-foreground"> of {formatMoney(totalLimit)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startCreate('blank')}>
                    New budget
                  </Button>
                  <Button variant="outline" size="sm" onClick={deleteBudget} className="text-expense">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {savedCategories.map((c) => {
                  const spent = spentFor(c.category);
                  const limit = Number(c.limit);
                  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                  const left = limit - spent;
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between text-sm font-medium">
                        <span>{c.category}</span>
                        <span>{formatMoney(spent)} / {formatMoney(limit)}</span>
                      </div>
                      {c.note && <p className="text-xs text-muted-foreground">{c.note}</p>}
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${barColor(percent)}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>{percent}% used</span>
                        <span className={left < 0 ? 'text-expense' : ''}>
                          {left >= 0 ? `${formatMoney(left)} left` : `${formatMoney(Math.abs(left))} over`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------- No budget yet: pick a template ---------- */}
        {!loading && !budgetId && !creating && (
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="font-semibold">No budget for {monthLabel} yet</p>
                <p className="text-sm text-muted-foreground">Start from a template, then change anything you like.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => startCreate(t.id)}
                    className="rounded-xl border border-border p-4 text-left hover:border-primary transition-colors"
                  >
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------- Builder: edit categories ---------- */}
        {!loading && creating && (
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="font-semibold">Build your budget</p>
                <p className="text-sm text-muted-foreground">Name each category and say briefly what it is for.</p>
              </div>

              {TemplateChips}

              <div className="hidden md:grid grid-cols-[1fr_1.5fr_120px_36px] gap-2 text-xs font-semibold text-muted-foreground">
                <span>Category</span>
                <span>What is it for?</span>
                <span>Limit (GH₵)</span>
                <span />
              </div>

              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_120px_36px] gap-2 items-center"
                  >
                    <Input
                      value={row.category}
                      placeholder="e.g. Transport"
                      aria-label="Category name"
                      onChange={(e) => updateRow(index, { category: e.target.value })}
                    />
                    <Input
                      value={row.note}
                      placeholder="What is this for?"
                      aria-label="What it is for"
                      onChange={(e) => updateRow(index, { note: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={0}
                      value={row.limit}
                      aria-label="Monthly limit"
                      onChange={(e) => updateRow(index, { limit: Number(e.target.value) })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeRow(index)} aria-label="Remove category" className="text-expense">
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={addRow}>
                  + Add category
                </Button>
                <p className="text-sm font-medium">
                  Total: {formatMoney(rows.reduce((s, r) => s + Number(r.limit || 0), 0))}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={saveBudget}
                  disabled={saving}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark"
                >
                  {saving ? 'Saving...' : 'Save budget'}
                </Button>
                <Button variant="outline" onClick={() => setCreating(false)} disabled={saving}>
                  Cancel
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
