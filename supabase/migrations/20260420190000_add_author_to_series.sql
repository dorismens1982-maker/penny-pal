-- Add author_name column to blog_series table
ALTER TABLE public.blog_series 
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Update existing series if needed (optional)
-- UPDATE public.blog_series SET author_name = 'Anonymous' WHERE author_name IS NULL;
