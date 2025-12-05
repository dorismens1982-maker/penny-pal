import React from 'react';
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
}

export const TransactionsTab = ({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredTransactions,
    onAddTransaction,
    onDeleteTransaction
}: TransactionsTabProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
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
