import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

interface TransactionsContextType {
    transactions: Transaction[];
    loading: boolean;
    addTransaction: (transactionData: {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        note?: string;
        date: string;
    }) => Promise<{ data: Transaction | null; error: any }>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<{ data: Transaction | null; error: any }>;
    deleteTransaction: (id: string) => Promise<void>;
    deleteAllTransactions: () => Promise<void>;
    refetch: () => Promise<void>;
    totals: { income: number; expenses: number };
    balance: number;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        if (!user) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error fetching transactions',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transactionData: {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        note?: string;
        date: string;
    }) => {
        if (!user) return { data: null, error: 'User not authenticated' };

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    ...transactionData,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;

            setTransactions(prev => [data, ...prev]);
            toast({
                title: 'Transaction added!',
                description: `₵${transactionData.amount.toFixed(2)} ${transactionData.type} recorded.`,
                className: 'animate-success-pulse',
            });

            return { data, error: null };
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error adding transaction',
                description: error.message,
            });
            return { data: null, error };
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        if (!user) return { data: null, error: 'User not authenticated' };

        try {
            const { data, error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setTransactions(prev => prev.map(t => (t.id === id ? data : t)));
            toast({
                title: 'Transaction updated!',
                description: 'Your changes have been saved.',
                className: 'animate-success-pulse',
            });

            return { data, error: null };
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error updating transaction',
                description: error.message,
            });
            return { data: null, error };
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTransactions(prev => prev.filter(t => t.id !== id));
            toast({
                title: 'Transaction deleted',
                description: 'The transaction has been removed.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error deleting transaction',
                description: error.message,
            });
        }
    };

    const deleteAllTransactions = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setTransactions([]);
            toast({
                title: 'All transactions deleted',
                description: 'Your transaction history has been cleared.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error deleting transactions',
                description: error.message,
            });
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    // Real-time subscription for instant updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Calculate totals
    const totals = transactions.reduce(
        (acc, transaction) => {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expenses += transaction.amount;
            }
            return acc;
        },
        { income: 0, expenses: 0 }
    );

    const balance = totals.income - totals.expenses;

    return (
        <TransactionsContext.Provider value={{
            transactions,
            loading,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            deleteAllTransactions,
            refetch: fetchTransactions,
            totals,
            balance,
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionsContext);
    if (context === undefined) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }
    return context;
};
