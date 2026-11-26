-- Short description of what each budget category is for (e.g. "Trotro fare to school")
ALTER TABLE public.budget_categories ADD COLUMN IF NOT EXISTS note text;
