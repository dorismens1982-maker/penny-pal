-- Create blog_series table
CREATE TABLE IF NOT EXISTS public.blog_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    excerpt TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add series_id and series_order to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.blog_series(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS series_order INTEGER;

-- Enable RLS on blog_series
ALTER TABLE public.blog_series ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_series
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_series' AND policyname = 'Anyone can view published series'
    ) THEN
        CREATE POLICY "Anyone can view published series" ON public.blog_series
            FOR SELECT USING (published = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_series' AND policyname = 'Admins can insert series'
    ) THEN
        CREATE POLICY "Admins can insert series" ON public.blog_series
            FOR INSERT WITH CHECK (
                (auth.jwt() ->> 'email' LIKE '%@bigsamcreates.com') OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.user_id = auth.uid() 
                    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_series' AND policyname = 'Admins can update series'
    ) THEN
        CREATE POLICY "Admins can update series" ON public.blog_series
            FOR UPDATE USING (
                (auth.jwt() ->> 'email' LIKE '%@bigsamcreates.com') OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.user_id = auth.uid() 
                    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_series' AND policyname = 'Admins can delete series'
    ) THEN
        CREATE POLICY "Admins can delete series" ON public.blog_series
            FOR DELETE USING (
                (auth.jwt() ->> 'email' LIKE '%@bigsamcreates.com') OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.user_id = auth.uid() 
                    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                )
            );
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_series_id ON public.blog_posts(series_id);
CREATE INDEX IF NOT EXISTS idx_blog_series_slug ON public.blog_series(slug);
