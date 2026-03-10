// @ts-nocheck - Deno runtime file: TS errors here are false positives (VS Code has no Deno extension)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const ALLOWED_ORIGINS = [
  'https://mypennypal.com',
  'https://www.mypennypal.com',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173'
];
const getCorsHeaders = (req) => {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }
  const corsHeaders = getCorsHeaders(req);

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for API Key
    const resendApiKey = Deno.env.get('NEWSLETTER_KEY');
    if (!resendApiKey) {
      throw new Error('Missing NEWSLETTER_KEY');
    }

    const resend = new Resend(resendApiKey);

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch 2 latest blog posts
    const { data: latestPosts } = await supabaseClient
      .from('blog_posts')
      .select('title, slug, excerpt, image_url')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(2);

    // CONFIGURATION
    const SENDER_EMAIL = 'Penny Pal <support@mypennypal.com>';

    console.log(`Sending Newsletter Welcome Email to ${email}`);

    // Helper for blog post HTML
    const blogHtml = latestPosts && latestPosts.length > 0
      ? latestPosts.map(post => `
        <div style="margin-bottom: 24px; text-align: left; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
          <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration: none;">
            <img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 160px; object-fit: cover; border-bottom: 1px solid #f1f5f9;" />
            <div style="padding: 16px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.4;">${post.title}</h3>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">${post.excerpt.substring(0, 100)}...</p>
              <div style="margin-top: 12px; font-size: 14px; font-weight: 600; color: #eab308;">Read more →</div>
            </div>
          </a>
        </div>
      `).join('')
      : '';

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: 'Welcome to the Penny Pal Newsletter! 🚀',
      text: `Welcome to the Penny Pal Circle! 🚀`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .card { background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
              .logo { display: block; width: 64px; height: 64px; border-radius: 20px; margin: 0 auto 32px; }
              .heading { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; text-align: center; line-height: 1.2; }
              .text { font-size: 16px; color: #475569; line-height: 1.6; text-align: center; margin-bottom: 32px; }
              .button { display: block; background-color: #1e293b; color: #ffffff; padding: 18px 32px; border-radius: 16px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; margin-bottom: 40px; }
              .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 24px; text-align: center; }
              .footer { text-align: center; padding-top: 40px; border-top: 1px solid #f1f5f9; }
              .social-link { display: inline-block; margin: 0 8px; opacity: 0.5; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <img src="https://www.mypennypal.com/email-assets/penny_avatar.jpg" alt="Logo" class="logo" />
                <h1 class="heading">You're on the list!</h1>
                <p class="text">Welcome to the Penny Pal Newsletter. You'll now receive weekly insights, market updates, and wealth-building tips straight from our experts.</p>
                
                <a href="https://www.mypennypal.com/insights" class="button">Visit The Hub</a>
                
                ${latestPosts && latestPosts.length > 0 ? `
                  <div class="section-title">Latest Financial Insights</div>
                  ${blogHtml}
                  <div style="text-align: center; margin-bottom: 40px;">
                    <a href="https://www.mypennypal.com/insights" style="color: #64748b; font-size: 14px; text-decoration: none; font-weight: 500;">View all insights →</a>
                  </div>
                ` : ''}
                
                <div class="footer">
                  <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Follow the movement</p>
                  <div style="margin-bottom: 24px;">
                    <a href="https://x.com/pennypalhq" class="social-link"><img src="https://www.mypennypal.com/email-assets/x_icon.png" width="20" height="20" /></a>
                    <a href="https://www.instagram.com/pennypalhq/" class="social-link"><img src="https://www.mypennypal.com/email-assets/insta_icon.png" width="20" height="20" /></a>
                    <a href="https://www.tiktok.com/@pennypalhq" class="social-link"><img src="https://www.mypennypal.com/email-assets/tiktok_icon.png" width="20" height="20" /></a>
                  </div>
                  <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Penny Pal. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: 'Newsletter welcome email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
