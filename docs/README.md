# Kudimate API and Components Documentation

This documentation covers all public APIs exported by the project: components, hooks, context providers, utilities, UI primitives, and Supabase integrations. It includes import paths, prop/return types, and usage examples.

## Import conventions

- Path alias: `@` maps to the `src/` directory.
- Example:
```ts
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
```

## Table of contents
- [Components](./components.md)
- [Hooks](./hooks.md)
- [Contexts](./contexts.md)
- [Utilities](./utils.md)
- [Integrations](./integrations.md)
- [UI Components (shadcn)](./ui-components.md)

## Prerequisites
- Ensure `<Toaster />` from `@/components/ui/toaster` is mounted once (e.g., in `App`) for toast notifications.
- React 18+, TypeScript, TailwindCSS, and shadcn/ui are used throughout examples.

## Versioning note
This documentation reflects the current code in this repository. If you update APIs, please update the docs accordingly.
