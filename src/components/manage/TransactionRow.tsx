import React, { useState, memo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';
import { CurrencyCode } from '@/utils/currencyConfig';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    note?: string;
}

interface TransactionRowProps {
    t: Transaction;
    onDelete: (id: string) => void;
    onEdit: (t: Transaction) => void;
    currency: CurrencyCode;
}

export const TransactionRow = memo(({ t, onDelete, onEdit, currency }: TransactionRowProps) => {
    const [expand, setExpand] = useState(false);
    const MAX_NOTE_LENGTH = 50;
    const longNote = t.note && t.note.length > MAX_NOTE_LENGTH;
    const note = !t.note ? null : expand ? t.note : t.note.slice(0, MAX_NOTE_LENGTH) + (longNote ? '…' : '');

    return (
        <div className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors border-b last:border-0 group">
            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(t)}>
                <div className={`w-10 h-10 rounded-full grid place-items-center ${t.type === 'income' ? 'bg-income/10' : 'bg-expense/10'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-income" /> : <ArrowDownLeft className="w-5 h-5 text-expense" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">{t.category}</p>
                        <p className={`font-poppins font-bold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                    {note && (
                        <div className="text-sm text-muted-foreground mt-1">
                            <span>{note}</span>
                            {longNote && (
                                <button onClick={(e) => { e.stopPropagation(); setExpand((v) => !v); }} className="text-primary hover:underline text-xs ml-1">
                                    {expand ? 'less' : 'more'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(t)}
                    className="hidden md:inline-flex text-muted-foreground hover:text-primary"
                >
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(t.id)}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
});

TransactionRow.displayName = 'TransactionRow';
