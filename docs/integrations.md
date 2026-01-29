# Integrations

## Supabase Client
- Import: `import { supabase } from '@/integrations/supabase/client'`
- Description: Preconfigured Supabase client with localStorage auth persistence.
- Example:
```ts
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.from('transactions').select('*');
```

## Supabase Types
- Import types: `import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types'`
- Example:
```ts
import type { Tables } from '@/integrations/supabase/types';
type Transaction = Tables<'transactions'>;
```

Notes:
- The client uses environment-provisioned URL and publishable key embedded in the generated file.
