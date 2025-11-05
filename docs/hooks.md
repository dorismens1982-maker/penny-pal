# Hooks

All hooks use the `@` path alias. Ensure your app wraps with required providers (e.g., `AuthProvider`) where noted.

## useTransactions
- Import: `import { useTransactions } from '@/hooks/useTransactions'`
- Returns:
  - `transactions: Tables<'transactions'>[]`
  - `loading: boolean`
  - `addTransaction(input: { amount: number; type: 'income' | 'expense'; category: string; note?: string; date: string; }): Promise<{ data: any; error: any }>`
  - `deleteTransaction(id: string): Promise<void>`
  - `deleteAllTransactions(): Promise<void>`
  - `refetch(): Promise<void>`
  - `totals: { income: number; expenses: number }`
  - `balance: number`
- Requires: `AuthProvider` and Supabase client configured.
- Example:
```tsx
import { useTransactions } from '@/hooks/useTransactions';

function TransactionsList() {
  const { transactions, addTransaction, deleteTransaction, loading } = useTransactions();

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <button onClick={() => addTransaction({ amount: 10, type: 'expense', category: 'Food', date: '2025-10-01' })}>
        Add
      </button>
      <ul>
        {transactions.map(t => (
          <li key={t.id}>
            {t.date} {t.category} {t.amount}
            <button onClick={() => deleteTransaction(t.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## useMonthlySummaries
- Import: `import { useMonthlySummaries, type MonthlySummary } from '@/hooks/useMonthlySummaries'`
- Params: `options?: { limit?: number; startDate?: Date; endDate?: Date }`
- Returns: `{ summaries, loading, refetch, getCurrentMonthSummary, getLastMonthSummary, getMonthName }`
- Example:
```tsx
const { summaries, getCurrentMonthSummary, getLastMonthSummary } = useMonthlySummaries({ limit: 3 });
```

## useCategoryAnalytics
- Import: `import { useCategoryAnalytics } from '@/hooks/useCategoryAnalytics'`
- Params: `options?: { startDate?: Date; endDate?: Date }`
- Returns: `{ topCategories, monthlyCategoryData, categoryTrends, loading, refetch, getTopCategoryForMonth }`
- Example:
```tsx
const { topCategories, categoryTrends } = useCategoryAnalytics();
```

## useProfile
- Import: `import { useProfile, type ProfileInput } from '@/hooks/useProfile'`
- Returns: `{ profile, updating, updateProfile(input), getProfile() }`
- Example:
```tsx
const { profile, updateProfile } = useProfile();
await updateProfile({ preferred_name: 'Jane' });
```

## useNewMonthDetection
- Import: `import { useNewMonthDetection } from '@/hooks/useNewMonthDetection'`
- Side effects: Shows a toast at the beginning of a new month with insights.
- Example:
```tsx
function App() {
  useNewMonthDetection();
  return <div />;
}
```

## usePageHeader
- Import: `import { usePageHeader, type PageHeaderConfig } from '@/hooks/usePageHeader'`
- Params: `pageIdentifier: string`
- Returns: `{ header, loading, error }`
- Example:
```tsx
const { header } = usePageHeader('learn');
```

## useIsMobile
- Import: `import { useIsMobile } from '@/hooks/use-mobile'`
- Returns: `boolean`
- Example:
```tsx
const isMobile = useIsMobile();
```
