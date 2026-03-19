
-- Fix voice_feedback table schema and relationships
-- This migration ensures that voice feedback is correctly linked to user profiles
-- for display in the Super Admin dashboard and establishes proper RLS policies.

DO $$ 
BEGIN
    -- 1. Create table if it doesn't exist (it should, but just in case)
    CREATE TABLE IF NOT EXISTS public.voice_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 2. Ensure the relationship to profiles exists for PostgREST joins
    -- We link voice_feedback.user_id to profiles.user_id (which is unique)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'voice_feedback_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE public.voice_feedback
        ADD CONSTRAINT voice_feedback_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
        ON DELETE CASCADE;
    END IF;

    -- 3. Enable RLS
    ALTER TABLE public.voice_feedback ENABLE ROW LEVEL SECURITY;

END $$;

-- 4. Policies
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.voice_feedback;
CREATE POLICY "Users can insert their own feedback" ON public.voice_feedback
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Explicitly allow admins to see ALL feedback entries
DROP POLICY IF EXISTS "Admins can read all feedback" ON public.voice_feedback;
CREATE POLICY "Admins can read all feedback" ON public.voice_feedback
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
