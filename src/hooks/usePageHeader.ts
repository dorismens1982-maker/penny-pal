import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PageHeaderConfig {
  id: string;
  page_identifier: string;
  title: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  alt_text: string;
  height_mobile: string;
  height_desktop: string;
  overlay_opacity: number;
  text_color: 'light' | 'dark';
  is_active: boolean;
}

export const usePageHeader = (pageIdentifier: string) => {
  const [header, setHeader] = useState<PageHeaderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeader = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('page_headers')
          .select('*')
          .eq('page_identifier', pageIdentifier)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) throw fetchError;

        setHeader(data as PageHeaderConfig | null);
      } catch (err: any) {
        console.error('Error fetching page header:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeader();
  }, [pageIdentifier]);

  return { header, loading, error };
};
