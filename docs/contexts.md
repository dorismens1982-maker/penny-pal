# Contexts

## AuthContext
- Imports:
  - Hook: `import { useAuth } from '@/contexts/AuthContext'`
  - Provider: `import { AuthProvider } from '@/contexts/AuthContext'`
- Provider usage:
```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
```
- `useAuth()` returns:
  - `user: User | null`
  - `session: Session | null`
  - `loading: boolean`
  - `profile: { user_id: string; preferred_name: string | null; ... } | null`
  - `refreshProfile(): Promise<void>`
  - `signUp(email: string, password: string, preferredName?: string): Promise<{ error: any }>`
  - `signIn(email: string, password: string): Promise<{ error: any; profile?: Profile }>`
  - `signOut(): Promise<void>`
- Notes:
  - Relies on Supabase Auth and the `profiles` table; gracefully falls back to auth metadata if the row is missing.
