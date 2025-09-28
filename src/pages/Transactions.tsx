import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { useSearchParams } from 'react-router-dom';

const Transactions = () => {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter from query param on mount
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'income' || typeParam === 'expense') {
      setFilterType(typeParam);
    }
  }, []);

  // Keep URL in sync when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (filterType === 'income' || filterType === 'expense') {
      params.set('type', filterType);
    } else {
      params.delete('type');
    }
    setSearchParams(params, { replace: true });
  }, [filterType]);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.note && transaction.note.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesFilter;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortBy]);

  const formatCurrency = (amount: number) => `₵${amount.toFixed(2)}`;

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const clearFilter = () => {
    setFilterType('all');
    const params = new URLSearchParams(searchParams);
    params.delete('type');
    setSearchParams(params, { replace: true });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddTransaction={() => setShowAddModal(true)}>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-poppins font-bold text-foreground">
            {filterType === 'income' ? 'Income Transactions' : filterType === 'expense' ? 'Expense Transactions' : 'Transactions'}
          </h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                    <SelectItem value="expense">Expenses Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Newest First)</SelectItem>
                    <SelectItem value="amount">Amount (Highest First)</SelectItem>
                    <SelectItem value="category">Category (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </p>
          {filterType !== 'all' && (
            <Button variant="outline" onClick={clearFilter}>View All Transactions</Button>
          )}
        </div>

        {/* Transactions List */}
        <Card className="shadow-md">
          <CardContent className="p-0">
            {filteredAndSortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'No transactions match your filters' 
                    : 'No transactions yet'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Add your first transaction
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredAndSortedTransactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-6 h-6 text-income" />
                        ) : (
                          <ArrowDownLeft className="w-6 h-6 text-expense" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground text-lg">
                              {transaction.category}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            {transaction.note && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {transaction.note}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={`text-xl font-poppins font-bold ${
                                transaction.type === 'income' ? 'text-income' : 'text-expense'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddTransactionModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </Layout>
  );
};

export default Transactions;
