-- Add Admin SELECT policies for blog_series and blog_posts
-- These allow admins to view drafts and unpublished content in the dashboard

DO $$ 
BEGIN
    -- Policy for blog_series
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_series' AND policyname = 'Admins can view all series'
    ) THEN
        CREATE POLICY "Admins can view all series" ON public.blog_series
            FOR SELECT USING (
                (auth.jwt() ->> 'email' LIKE '%@bigsamcreates.com') OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.user_id = auth.uid() 
                    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                )
            );
    END IF;

    -- Policy for blog_posts (if not already covered by a generic admin policy)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Admins can view all posts'
    ) THEN
        CREATE POLICY "Admins can view all posts" ON public.blog_posts
            FOR SELECT USING (
                (auth.jwt() ->> 'email' LIKE '%@bigsamcreates.com') OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.user_id = auth.uid() 
                    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                )
            );
    END IF;
END $$;
