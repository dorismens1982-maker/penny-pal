/*
  # Seed Page Headers with Financial-Themed Images

  Inserts initial header configurations for all main pages using financial-themed stock photos.
  All images are from Pexels and are free to use.
*/

INSERT INTO page_headers (page_identifier, title, subtitle, image_url, alt_text, height_mobile, height_desktop, overlay_opacity, text_color, is_active)
VALUES
  (
    'dashboard',
    'Your Financial Dashboard',
    'Your finances at a glance',
    'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Financial charts and graphs on a desk',
    '200px',
    '280px',
    0.5,
    'light',
    true
  ),
  (
    'transactions',
    'Your Transactions',
    'View and manage all your transactions',
    'https://images.pexels.com/photos/4475523/pexels-photo-4475523.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Person managing financial documents and receipts',
    '180px',
    '250px',
    0.5,
    'light',
    true
  ),
  (
    'analytics',
    'Financial Analytics',
    'Insights into your spending habits',
    'https://images.pexels.com/photos/7567486/pexels-photo-7567486.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Data analytics and financial charts',
    '180px',
    '250px',
    0.5,
    'light',
    true
  ),
  (
    'settings',
    'Account Settings',
    'Manage your account and preferences',
    'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Person working with laptop and financial documents',
    '180px',
    '240px',
    0.5,
    'light',
    true
  ),
  (
    'blog',
    'Financial Tips & Insights',
    'Learn how to save, invest, and manage your money better',
    'https://images.pexels.com/photos/6120215/pexels-photo-6120215.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Person reading financial news and learning',
    '200px',
    '260px',
    0.5,
    'light',
    true
  ),
  (
    'blog-post',
    'Financial Insights',
    'Expert advice for better money management',
    'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Open book with financial content',
    '180px',
    '240px',
    0.5,
    'light',
    true
  ),
  (
    'auth',
    'Welcome to Kudimate',
    'Your personal budget tracker for smart financial management',
    'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'Clean workspace with financial planning tools',
    '220px',
    '300px',
    0.5,
    'light',
    true
  )
ON CONFLICT (page_identifier) DO NOTHING;
