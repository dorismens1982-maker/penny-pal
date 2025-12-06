import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { DollarSign, Calendar, Tag, FileText } from 'lucide-react';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType?: 'income' | 'expense';
}

export const AddTransactionModal = ({ open, onOpenChange, transactionType = 'expense' }: AddTransactionModalProps) => {
  const { addTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: transactionType as 'income' | 'expense',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const commonCategories = {
    income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Bonus', 'Other Income'],
    expense: ['Food & Dining 🍽️', 'Transportation 🚗', 'Shopping 🛒', 'Entertainment 🎬',
      'Bills & Utilities ⚡', 'Healthcare 🏥', 'Education 📚', 'Travel ✈️',
      'Groceries 🛍️', 'Rent 🏠', 'Other Expense']
  };

  const loanIncomeCategories = ['Loan Received 💰', 'Loan Repayment Received 💵'];
  const loanExpenseCategories = ['Loan Payment 💳', 'Loan Given 🤝'];
  const categoriesForType = formData.type === 'income'
    ? [...loanIncomeCategories, ...commonCategories.income]
    : [...loanExpenseCategories, ...commonCategories.expense];

  // Emoji-augmented income categories (without altering stored values)
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

    const { error } = await addTransaction({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      note: formData.note || undefined,
      date: formData.date
    });

    if (!error) {
      // Reset form
      setFormData({
        amount: '',
        type: transactionType,
        category: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
      onOpenChange(false);
    }

    setLoading(false);
  };

  const title = formData.type === 'income' ? 'Add Money' : 'Record Spending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Transaction Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={formData.type === 'expense' ? 'default' : 'ghost'}
              className={`flex-1 ${formData.type === 'expense' ? 'bg-gradient-danger' : ''}`}
              onClick={() => {
                handleInputChange('type', 'expense');
                handleInputChange('category', ''); // Reset category when switching type
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
                handleInputChange('category', ''); // Reset category when switching type
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
                className="pl-10"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
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
                  className="pl-10"
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
                className="pl-10"
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
                className="pl-10 resize-none"
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
              onClick={() => onOpenChange(false)}
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
              {loading ? 'Saving...' : formData.type === 'income' ? 'Add Money' : 'Record Spending'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
