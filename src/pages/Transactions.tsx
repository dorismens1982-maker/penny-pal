import React, { useState, useMemo, useEffect, memo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { Search, ArrowUpRight, ArrowDownLeft, Trash2, Plus } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { usePageHeader } from '@/hooks/usePageHeader';
import { Badge } from '@/components/ui/badge';

const MAX_NOTE_LENGTH = 50;

// --- Helpers ---
const fmtAmt = (n: number) => `₵${n.toFixed(2)}`;
const dayKey = (iso: string) => {
  // Normalize date key to local yyyy-mm-dd for grouping
  const d = new Date(iso);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2,'0'), da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
};
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date(); const yest = new Date(); yest.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  if (same(d, today)) return 'Today';
  if (same(d, yest)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Row ---
const TransactionRow = memo(({ t, onDelete }: { t: any; onDelete: (id: string) => void }) => {
  const [expand, setExpand] = useState(false);
  const longNote = t.note && t.note.length > MAX_NOTE_LENGTH;
  const note = !t.note ? null : expand ? t.note : t.note.slice(0, MAX_NOTE_LENGTH) + (longNote ? '…' : '');
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full grid place-items-center ${t.type==='income'?'bg-income/10':'bg-expense/10'}`} aria-hidden>
          {t.type==='income' ? <ArrowUpRight className="w-5 h-5 text-income" /> : <ArrowDownLeft className="w-5 h-5 text-expense" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate">{t.category}</p>
            <p className={`font-poppins font-bold shrink-0 ${t.type==='income'?'text-income':'text-expense'}`}>
              {t.type==='income' ? '+' : '-'}{fmtAmt(t.amount)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(t.date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
          </p>
          {note && (
            <div className="text-sm text-muted-foreground mt-1">
              <span className="line-clamp-2">{note}</span>
              {longNote && (
                <button onClick={() => setExpand(v=>!v)} className="text-primary hover:underline text-xs ml-1">
                  {expand ? 'Show less' : 'Show more'}
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
        aria-label="Delete transaction"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
});
TransactionRow.displayName = 'TransactionRow';

// --- Toolbar segmented control (All / Income / Expense) ---
function TypeSegment({
  value, onChange, counts
}:{
  value: 'all'|'income'|'expense';
  onChange: (v:'all'|'income'|'expense')=>void;
  counts: { all:number; income:number; expense:number };
}) {
  const base = "px-3 py-1.5 rounded-full text-sm";
  return (
    <div className="inline-flex bg-muted rounded-full p-1">
      {(['all','income','expense'] as const).map(k => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`${base} ${value===k ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
        >
          {k[0].toUpperCase()+k.slice(1)} <Badge variant="outline" className="ml-1">{counts[k]}</Badge>
        </button>
      ))}
    </div>
  );
}

const PAGE_SIZE = 25;

export default function Transactions() {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState<'all'|'income'|'expense'>('all');
  const [sortBy, setSortBy] = useState<'date'|'amount'|'category'>('date');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [searchParams, setSearchParams] = useSearchParams();
  const { header } = usePageHeader('transactions');

  // URL ↔ filter sync
  useEffect(() => {
    const q = searchParams.get('type');
    if (q === 'income' || q === 'expense') setType(q);
  }, []);
  useEffect(() => {
    const p = new URLSearchParams(searchParams);
    if (type === 'all') p.delete('type'); else p.set('type', type);
    setSearchParams(p, { replace: true });
  }, [type]);

  // Counts for chips
  const counts = useMemo(() => {
    let income=0, expense=0;
    for (const t of transactions) t.type==='income'?income++:expense++;
    return { all: transactions.length, income, expense };
  }, [transactions]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let arr = transactions.filter(t => {
      const matchesType = type==='all' || t.type===type;
      if (!matchesType) return false;
      if (!q) return true;
      const inCat = t.category.toLowerCase().includes(q);
      const inNote = t.note ? t.note.toLowerCase().includes(q) : false;
      return inCat || inNote;
    });
    arr.sort((a,b) => {
      if (sortBy==='date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy==='amount') return b.amount - a.amount;
      return a.category.localeCompare(b.category);
    });
    return arr;
  }, [transactions, searchTerm, type, sortBy]);

  // Group by day
  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const t of filtered) {
      const k = dayKey(t.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    // newest day first
    return Array.from(map.entries()).sort(([a],[b]) => (a > b ? -1 : 1));
  }, [filtered]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction?')) await deleteTransaction(id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 space-y-3 animate-pulse">
          <div className="h-12 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
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

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <TypeSegment value={type} onChange={setType} counts={counts} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search category or notes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(v:any)=>setSortBy(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (newest)</SelectItem>
                <SelectItem value="amount">Amount (high→low)</SelectItem>
                <SelectItem value="category">Category (A→Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {transactions.length} transactions
          </p>
          {type!=='all' && (
            <Button variant="outline" onClick={() => setType('all')}>Clear filter</Button>
          )}
        </div>

        {/* Grouped list */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-3">
                  {searchTerm || type!=='all' ? 'No transactions match your filters' : 'No transactions yet'}
                </p>
                {!searchTerm && type==='all' && (
                  <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Add your first transaction
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {groups.slice(0).map(([k, items]) => (
                  <section key={k} className="py-1">
                    <header className="px-4 py-2 sticky top-[56px] sm:top-[54px] bg-background/95 backdrop-blur z-10 border-b">
                      <h3 className="text-xs font-medium text-muted-foreground">{dayLabel(k)}</h3>
                    </header>
                    <div className="divide-y divide-border">
                      {items.slice(0, visible).map((t: any, idx: number) => (
                        <TransactionRow key={t.id} t={t} onDelete={handleDelete} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load more */}
        {filtered.length > visible && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setVisible(v => v + PAGE_SIZE)}>
              Load {Math.min(PAGE_SIZE, filtered.length - visible)} more
            </Button>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="fixed right-4 bottom-20 sm:hidden">
        <Button onClick={() => setShowAddModal(true)} className="rounded-full h-12 w-12 p-0 shadow-lg">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
    </Layout>
  );
}
