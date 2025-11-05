# Utilities

## `cn`
- Import: `import { cn } from '@/lib/utils'`
- Signature: `cn(...inputs: ClassValue[]): string`
- Description: Merges conditional class names with Tailwind merge semantics.
- Example:
```ts
<div className={cn('px-2', isActive && 'text-primary')} />
```

## Trend calculations
- Import: `import { calculateTrend, calculateMovingAverage, getOverallTrend, getMonthTrend, getSpendingTrendSummary, type TrendData } from '@/utils/trendCalculations'`
- Examples:
```ts
const t = calculateTrend(120, 100, true);
const ma = calculateMovingAverage(summaries, 'balance', 3);
const overall = getOverallTrend(summaries);
```
