import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionRow } from './TransactionRow';

interface TransactionsTabProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: 'date' | 'amount' | 'category';
    setSortBy: (value: 'date' | 'amount' | 'category') => void;
    filteredTransactions: any[];
    onAddTransaction: () => void;
    onDeleteTransaction: (id: string) => void;
    filterType: 'all' | 'income' | 'expense';
    setFilterType: (value: 'all' | 'income' | 'expense') => void;
    counts: { all: number; income: number; expense: number };
}

function TypeSegment({
    value, onChange, counts
}: {
    value: 'all' | 'income' | 'expense';
    onChange: (v: 'all' | 'income' | 'expense') => void;
    counts: { all: number; income: number; expense: number };
}) {
    const base = "px-3 py-1.5 rounded-full text-sm transition-all";
    return (
        <div className="inline-flex bg-muted rounded-full p-1">
            {(['all', 'income', 'expense'] as const).map(k => (
                <button
                    key={k}
                    onClick={() => onChange(k)}
                    className={`${base} ${value === k ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {k[0].toUpperCase() + k.slice(1)} <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5 min-w-[1.25rem]">{counts[k]}</Badge>
                </button>
            ))}
        </div>
    );
}

export const TransactionsTab = ({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredTransactions,
    onAddTransaction,
    onDeleteTransaction,
    filterType,
    setFilterType,
    counts
}: TransactionsTabProps) => {
    return (
        <div className="space-y-4">
            {/* Visual Header */}
            <div className="relative w-full h-32 md:h-40 rounded-xl overflow-hidden bg-muted mb-4 group">
                <img
                    src="/vibe_transactions.png"
                    alt="Transactions"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h2 className="text-white font-bold text-xl md:text-2xl">Transaction History</h2>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <TypeSegment value={filterType} onChange={setFilterType} counts={counts} />
                <div className="flex-1 flex items-center gap-2">
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
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-0">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-3">No transactions found</p>
                            <Button onClick={onAddTransaction} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Transaction
                            </Button>
                        </div>
                    ) : (
                        <div>
                            {filteredTransactions.map((t) => (
                                <TransactionRow key={t.id} t={t} onDelete={onDeleteTransaction} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
