-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create monthly_summaries table to store calculated monthly totals
CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  income NUMERIC NOT NULL DEFAULT 0,
  expenses NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Enable RLS
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own monthly summaries"
ON public.monthly_summaries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly summaries"
ON public.monthly_summaries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly summaries"
ON public.monthly_summaries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly summaries"
ON public.monthly_summaries
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_monthly_summaries_user_date ON public.monthly_summaries(user_id, year DESC, month DESC);

-- Trigger for updating updated_at
CREATE TRIGGER update_monthly_summaries_updated_at
BEFORE UPDATE ON public.monthly_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to recalculate and update monthly summary for a specific user/month/year
CREATE OR REPLACE FUNCTION public.recalculate_monthly_summary(p_user_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_income NUMERIC := 0;
  v_expenses NUMERIC := 0;
  v_balance NUMERIC := 0;
  v_count INTEGER := 0;
BEGIN
  -- Calculate totals from transactions table
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO v_income, v_expenses, v_count
  FROM transactions
  WHERE user_id = p_user_id
    AND EXTRACT(MONTH FROM date) = p_month
    AND EXTRACT(YEAR FROM date) = p_year;
  
  v_balance := v_income - v_expenses;
  
  -- Insert or update the monthly summary
  INSERT INTO monthly_summaries (user_id, month, year, income, expenses, balance, transaction_count)
  VALUES (p_user_id, p_month, p_year, v_income, v_expenses, v_balance, v_count)
  ON CONFLICT (user_id, month, year) 
  DO UPDATE SET
    income = v_income,
    expenses = v_expenses,
    balance = v_balance,
    transaction_count = v_count,
    updated_at = now();
END;
$$;

-- Trigger function to update monthly summary when transactions change
CREATE OR REPLACE FUNCTION public.update_monthly_summary_on_transaction_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM recalculate_monthly_summary(
      NEW.user_id,
      EXTRACT(MONTH FROM NEW.date)::INTEGER,
      EXTRACT(YEAR FROM NEW.date)::INTEGER
    );
  END IF;
  
  -- Handle UPDATE where date changed
  IF (TG_OP = 'UPDATE' AND OLD.date != NEW.date) THEN
    PERFORM recalculate_monthly_summary(
      OLD.user_id,
      EXTRACT(MONTH FROM OLD.date)::INTEGER,
      EXTRACT(YEAR FROM OLD.date)::INTEGER
    );
  END IF;
  
  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    PERFORM recalculate_monthly_summary(
      OLD.user_id,
      EXTRACT(MONTH FROM OLD.date)::INTEGER,
      EXTRACT(YEAR FROM OLD.date)::INTEGER
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on transactions table
CREATE TRIGGER trigger_update_monthly_summary
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_monthly_summary_on_transaction_change();