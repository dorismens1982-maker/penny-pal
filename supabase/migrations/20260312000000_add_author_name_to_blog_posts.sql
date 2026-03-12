-- Add author_name to blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Update existing posts to have "Penny Pal" as author_name if they are from the system
UPDATE public.blog_posts SET author_name = 'Penny Pal' WHERE author = 'Penny Pal' AND author_name IS NULL;
