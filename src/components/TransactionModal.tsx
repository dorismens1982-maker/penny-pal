import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

interface TransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionType?: 'income' | 'expense';
    transactionToEdit?: Transaction | null;
}

export const TransactionModal = ({ open, onOpenChange, transactionType = 'expense', transactionToEdit }: TransactionModalProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const title = transactionToEdit ? 'Edit Transaction' : 'Transaction';
    const description = transactionToEdit ? 'Update transaction details.' : 'Record your income or expenses.';

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[90vw] max-w-md sm:w-full">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-poppins">{title}</DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        onClose={() => onOpenChange(false)}
                        initialType={transactionType}
                        transactionToEdit={transactionToEdit}
                        key={transactionToEdit ? transactionToEdit.id : 'new'}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-8">
                    <TransactionForm
                        onClose={() => onOpenChange(false)}
                        initialType={transactionType}
                        transactionToEdit={transactionToEdit}
                        key={transactionToEdit ? transactionToEdit.id : 'new'}
                        className="pb-safe"
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

interface TransactionFormProps {
    onClose: () => void;
    initialType: 'income' | 'expense';
    className?: string;
    transactionToEdit?: Transaction | null;
}

const TransactionForm = ({ onClose, initialType, className, transactionToEdit }: TransactionFormProps) => {
    const { addTransaction, updateTransaction } = useTransactions();
    const [loading, setLoading] = useState(false);

    // Initialize state based on edit mode or default
    const [formData, setFormData] = useState({
        amount: '',
        type: initialType as 'income' | 'expense',
        category: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Reset or fill form when transactionToEdit changes
    useEffect(() => {
        if (transactionToEdit) {
            setFormData({
                amount: transactionToEdit.amount.toString(),
                type: transactionToEdit.type as 'income' | 'expense',
                category: transactionToEdit.category,
                note: transactionToEdit.note || '',
                date: new Date(transactionToEdit.date).toISOString().split('T')[0]
            });
        } else {
            // Reset to defaults if opening as "Add New"
            setFormData({
                amount: '',
                type: initialType,
                category: '',
                note: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [transactionToEdit, initialType]); // Re-run if these props change

    const commonCategories = {
        income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Bonus', 'Other Income'],
        expense: ['Food & Dining 🍽️', 'Transportation 🚗', 'Shopping 🛒', 'Entertainment 🎬',
            'Bills & Utilities ⚡', 'Healthcare 🏥', 'Education 📚', 'Travel ✈️',
            'Groceries 🛍️', 'Rent 🏠', 'Gifting 🎁', 'Other Expense']
    };

    const loanIncomeCategories = ['Loan Received 💰', 'Loan Repayment Received 💵'];
    const loanExpenseCategories = ['Loan Payment 💳', 'Loan Given 🤝'];
    const categoriesForType = formData.type === 'income'
        ? [...loanIncomeCategories, ...commonCategories.income]
        : [...loanExpenseCategories, ...commonCategories.expense];

    // Emoji-augmented income categories
    const incomeEmojiMap: Record<string, string> = {
        'Salary': 'Salary 💼',
        'Freelance': 'Freelance 🧑‍💻',
        'Business': 'Business 🏢',
        'Investment': 'Investment 📈',
        'Gift': 'Gift 🎁',
        'Bonus': 'Bonus 🎉',
        'Other Income': 'Other Income ➕',
    };
    const categoriesForTypeWithLabel = formData.type === 'income'
        ? categoriesForType.map((c) => ({ value: c, label: incomeEmojiMap[c] ?? c }))
        : categoriesForType.map((c) => ({ value: c, label: c }));

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || !formData.category || !formData.date) {
            return;
        }

        setLoading(true);

        let result;

        if (transactionToEdit) {
            result = await updateTransaction(transactionToEdit.id, {
                amount: parseFloat(formData.amount),
                type: formData.type,
                category: formData.category,
                note: formData.note || undefined,
                date: formData.date
            });
        } else {
            result = await addTransaction({
                amount: parseFloat(formData.amount),
                type: formData.type,
                category: formData.category,
                note: formData.note || undefined,
                date: formData.date
            });
        }

        const { error } = result;

        if (!error) {
            if (!transactionToEdit) {
                // Only clear if adding new. If editing, we usually close anyway.
                setFormData({
                    amount: '',
                    type: initialType,
                    category: '',
                    note: '',
                    date: new Date().toISOString().split('T')[0]
                });
            }
            onClose();
        }

        setLoading(false);
    };

    const isEditing = !!transactionToEdit;

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
            {/* Transaction Type Toggle - Only show if NOT editing (usually we don't switch type on edit, but we can allow it) 
          Let's allow it for flexibility as per plan.
      */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'ghost'}
                    className={`flex-1 ${formData.type === 'expense' ? 'bg-gradient-danger' : ''}`}
                    onClick={() => {
                        handleInputChange('type', 'expense');
                        // Don't clear category if it's already an expense category? 
                        // Simpler to just clear it to avoid mismatches, user can re-select.
                        if (formData.type !== 'expense') handleInputChange('category', '');
                    }}
                >
                    💸 Expense
                </Button>
                <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'ghost'}
                    className={`flex-1 ${formData.type === 'income' ? 'bg-gradient-success' : ''}`}
                    onClick={() => {
                        handleInputChange('type', 'income');
                        if (formData.type !== 'income') handleInputChange('category', '');
                    }}
                >
                    💰 Income
                </Button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (₵)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-10 text-base md:text-sm"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        required
                        autoFocus={false}
                    />
                </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label>Category</Label>
                <div className="space-y-2">
                    <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                    >
                        <SelectTrigger>
                            <div className="flex items-center">
                                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Choose a category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {categoriesForTypeWithLabel.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="text-center text-xs text-muted-foreground">or</div>

                    <div className="relative">
                        <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Create custom category"
                            className="pl-10 text-base md:text-sm"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="date"
                        type="date"
                        className="pl-10 text-base md:text-sm"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                        id="note"
                        placeholder="Add a note..."
                        className="pl-10 resize-none text-base md:text-sm"
                        rows={3}
                        value={formData.note}
                        onChange={(e) => handleInputChange('note', e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !formData.amount || !formData.category}
                    className={`flex-1 ${formData.type === 'income'
                        ? 'bg-gradient-success hover:opacity-90'
                        : 'bg-gradient-danger hover:opacity-90'
                        }`}
                >
                    {loading ? 'Saving...' : isEditing ? 'Update Transaction' : (formData.type === 'income' ? 'Add Money' : 'Record Spending')}
                </Button>
            </div>
        </form>
    );
};
