-- Create page_headers table
CREATE TABLE public.page_headers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_identifier TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  alt_text TEXT NOT NULL,
  height_mobile TEXT NOT NULL DEFAULT '200px',
  height_desktop TEXT NOT NULL DEFAULT '300px',
  overlay_opacity NUMERIC NOT NULL DEFAULT 0.4,
  text_color TEXT NOT NULL DEFAULT 'light',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_headers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active page headers"
ON public.page_headers
FOR SELECT
USING (is_active = true);

-- Create indexes
CREATE INDEX idx_page_headers_page_identifier ON public.page_headers(page_identifier);
CREATE INDEX idx_page_headers_is_active ON public.page_headers(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_page_headers_updated_at
BEFORE UPDATE ON public.page_headers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data with placeholder images
INSERT INTO public.page_headers (page_identifier, title, subtitle, image_url, alt_text) VALUES
('blog', 'Financial Wisdom Blog', 'Tips, insights, and strategies to help you manage your money better', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=400&fit=crop', 'Financial planning and money management'),
('dashboard', 'Your Financial Dashboard', 'Track your income, expenses, and savings all in one place', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop', 'Financial dashboard overview'),
('analytics', 'Financial Analytics', 'Deep dive into your spending patterns and trends', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop', 'Financial analytics and charts'),
('transactions', 'Transaction History', 'View and manage all your financial transactions', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=400&fit=crop', 'Transaction history'),
('settings', 'Account Settings', 'Manage your profile and preferences', 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&h=400&fit=crop', 'Account settings'),
('auth', 'Welcome to WalletWise', 'Your personal finance companion', 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=400&fit=crop', 'Welcome page');