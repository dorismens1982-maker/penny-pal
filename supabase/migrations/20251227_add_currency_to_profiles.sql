-- Add currency column to profiles table
-- Migration: 20251227_add_currency_to_profiles

-- Add currency column with default value
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'GHS';

-- Add check constraint to ensure only valid currency codes
ALTER TABLE public.profiles
ADD CONSTRAINT valid_currency_code 
CHECK (currency IN ('GHS', 'USD', 'EUR', 'GBP', 'NGN', 'ZAR'));

-- Backfill existing users with GHS (default currency)
UPDATE public.profiles 
SET currency = 'GHS' 
WHERE currency IS NULL OR currency = '';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.currency IS 'User preferred currency code (GHS, USD, EUR, GBP, NGN, ZAR)';
