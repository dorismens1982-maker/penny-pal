-- Add read_time column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5';
