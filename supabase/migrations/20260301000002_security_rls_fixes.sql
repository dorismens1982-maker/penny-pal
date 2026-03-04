-- Fix: Add missing write protection policies to page_headers table
-- Without these, there are no insert/update/delete policies (which defaults to deny,
-- but we need explicit policies for clarity and future-proofing)

-- Only the service role (backend/admin) can insert page headers  
CREATE POLICY "Only service_role can insert page_headers"
ON public.page_headers
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Only the service role can update page headers
CREATE POLICY "Only service_role can update page_headers"
ON public.page_headers
FOR UPDATE
USING (auth.role() = 'service_role');

-- Only the service role can delete page headers
CREATE POLICY "Only service_role can delete page_headers"
ON public.page_headers
FOR DELETE
USING (auth.role() = 'service_role');

-- Fix: Add a character limit to blog comments to prevent abuse and XSS via long strings
ALTER TABLE public.blog_post_comments
ADD CONSTRAINT comment_content_length CHECK (char_length(content) <= 1000);

-- Fix: Add a character limit constraint to prevent empty/whitespace-only comments
ALTER TABLE public.blog_post_comments
ADD CONSTRAINT comment_content_not_empty CHECK (trim(content) != '');
