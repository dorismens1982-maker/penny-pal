-- Add 'role' column to profiles to support server-side admin authorization
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Comment: Set this to 'admin' for your own account via Supabase Studio or SQL editor:
-- UPDATE public.profiles SET role = 'admin' WHERE user_id = '<your-user-uuid>';

-- Allow users to read their own role
CREATE POLICY "Users can view their own role"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Restrict updates to role column: only service_role (admin backend) can change roles
CREATE POLICY "Only service_role can update role"
ON public.profiles
FOR UPDATE
USING (auth.role() = 'service_role');
