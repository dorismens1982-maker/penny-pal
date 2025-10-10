/*
  # Create Page Headers Table

  1. New Tables
    - `page_headers`
      - `id` (uuid, primary key)
      - `page_identifier` (text, unique) - identifies which page this header is for
      - `title` (text) - header title text
      - `subtitle` (text, nullable) - optional subtitle text
      - `image_url` (text) - URL to the header image
      - `mobile_image_url` (text, nullable) - optional mobile-optimized image
      - `alt_text` (text) - accessibility alt text for image
      - `height_mobile` (text) - CSS height value for mobile (e.g., "200px")
      - `height_desktop` (text) - CSS height value for desktop (e.g., "300px")
      - `overlay_opacity` (numeric) - gradient overlay opacity (0-1)
      - `text_color` (text) - text color (light/dark)
      - `is_active` (boolean) - whether this header is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `page_headers` table
    - Add policy for public read access (headers are public content)
    - Add policy for authenticated users to manage headers (future admin feature)
*/

CREATE TABLE IF NOT EXISTS page_headers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_identifier text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  mobile_image_url text,
  alt_text text NOT NULL,
  height_mobile text DEFAULT '200px',
  height_desktop text DEFAULT '300px',
  overlay_opacity numeric DEFAULT 0.4,
  text_color text DEFAULT 'light',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_headers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active page headers"
  ON page_headers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert page headers"
  ON page_headers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update page headers"
  ON page_headers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete page headers"
  ON page_headers
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_page_headers_identifier ON page_headers(page_identifier);
CREATE INDEX IF NOT EXISTS idx_page_headers_active ON page_headers(is_active);
