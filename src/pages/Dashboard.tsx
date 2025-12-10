import React, { useMemo, useState, memo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNewMonthDetection } from '@/hooks/useNewMonthDetection';
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
          className={`w-9 h-9 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
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
          className={`font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'
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

const Dashboard = () => {
  const { transactions, balance, totals, loading } = useTransactions();
  const { profile, session } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const navigate = useNavigate();
  const { header } = usePageHeader('dashboard');

  useNewMonthDetection();

  const preferred =
    profile?.preferred_name || (session?.user?.user_metadata as any)?.preferred_name || '';

  const handleOpenMoneyModal = () => {
    setModalType('income');
    setShowAddModal(true);
  };

  const handleOpenSpendingModal = () => {
    setModalType('expense');
    setShowAddModal(true);
  };


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
    <Layout onAddTransaction={handleOpenSpendingModal}>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* BALANCE DISPLAY */}
        <div className="text-center space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">My Balance</p>
            <p className={`text-6xl font-poppins font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(balance)}
            </p>
          </div>

          {/* QUICK SUMMARY */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Received</p>
              <p className="font-semibold text-income">{formatCurrency(totals.income)}</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="font-semibold text-expense">{formatCurrency(totals.expenses)}</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={handleOpenMoneyModal}
            className="flex-1 h-12 text-base gap-2 bg-gradient-success hover:opacity-90"
          >
            <Plus className="w-5 h-5" />
            Add Money
          </Button>
          <Button
            onClick={handleOpenSpendingModal}
            className="flex-1 h-12 text-base gap-2 bg-gradient-danger hover:opacity-90"
          >
            <Plus className="w-5 h-5" />
            Spent Money
          </Button>
        </div>

        {/* RECENT TRANSACTIONS */}
        {recentTransactions.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => goToTransactions()}
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <RecentTransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} transactionType={modalType} />
    </Layout>
  );
};

export default Dashboard;
