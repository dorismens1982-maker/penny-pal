# Components

This section documents higher-level app components under `src/components`.

## Layout
- Import: `import { Layout } from '@/components/Layout'`
- Props:
  - `children: React.ReactNode`
  - `onAddTransaction?: () => void`
- Description: App chrome with header, mobile bottom nav, and optional floating "Add Transaction" button.
- Example:
```tsx
import { Layout } from '@/components/Layout';

export function Page() {
  return (
    <Layout onAddTransaction={() => console.log('add') }>
      <div>Content</div>
    </Layout>
  );
}
```

## PageHeader
- Import: `import { PageHeader } from '@/components/PageHeader'`
- Props:
  - `title: string`
  - `subtitle?: string`
  - `imageUrl: string`
  - `mobileImageUrl?: string`
  - `altText: string`
  - `heightMobile?: string` (default `200px`)
  - `heightDesktop?: string` (default `300px`)
  - `overlayOpacity?: number` (default `0.4`)
  - `textColor?: 'light' | 'dark'` (default `'light'`)
  - `children?: React.ReactNode`
- Example:
```tsx
<PageHeader
  title="Learn Finance"
  subtitle="Level up your money skills"
  imageUrl="/hero.jpg"
  altText="Hero"
/>
```

## ProtectedRoute
- Import: `import { ProtectedRoute } from '@/components/ProtectedRoute'`
- Props:
  - `children: React.ReactNode`
- Description: Redirects unauthenticated users to `/auth`.
- Example:
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## AddTransactionModal
- Import: `import { AddTransactionModal } from '@/components/AddTransactionModal'`
- Props:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
- Behavior: Creates a transaction via `useTransactions().addTransaction`.
- Example:
```tsx
const [open, setOpen] = useState(false);
<AddTransactionModal open={open} onOpenChange={setOpen} />
```

## DateRangePicker
- Import: `import { DateRangePicker, type DateRange, type DateRangePreset } from '@/components/DateRangePicker'`
- Props:
  - `value: DateRange`
  - `onChange: (range: DateRange, preset: DateRangePreset) => void`
  - `selectedPreset: DateRangePreset`
- Presets: `'last3months' | 'last6months' | 'last12months' | 'ytd' | 'all' | 'custom'`
- Example:
```tsx
const [range, setRange] = useState<DateRange>({ from: undefined, to: undefined });
const [preset, setPreset] = useState<DateRangePreset>('last3months');
<DateRangePicker
  value={range}
  selectedPreset={preset}
  onChange={(next, nextPreset) => { setRange(next); setPreset(nextPreset); }}
/>
```

## MonthlyComparison
- Import: `import { MonthlyComparison } from '@/components/MonthlyComparison'`
- Description: Compares current and last month using `useMonthlySummaries`.
- Example:
```tsx
<MonthlyComparison />
```

## PrivacyPolicyModal
- Import: `import PrivacyPolicyModal from '@/components/PrivacyPolicyModal'`
- Props:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
- Example:
```tsx
<PrivacyPolicyModal open={open} onOpenChange={setOpen} />
```
