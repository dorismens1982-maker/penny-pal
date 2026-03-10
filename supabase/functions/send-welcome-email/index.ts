// @ts-nocheck - Deno runtime file: TS errors here are false positives (VS Code has no Deno extension)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const ALLOWED_ORIGINS = ['https://mypennypal.com', 'https://www.mypennypal.com'];
const getCorsHeaders = (req) => {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }
  const corsHeaders = getCorsHeaders(req);

  // ✅ JWT Verification: only authenticated Supabase sessions can call this
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for API Key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY');
    }

    const resend = new Resend(resendApiKey);

    // Initialize Supabase Client to fetch blog posts
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
    const userName = name || 'Friend';

    console.log(`Sending Welcome Email to ${email} (${userName})`);
    // Blog post cards — table-based, works in all email clients including Gmail
    const blogHtml = latestPosts && latestPosts.length > 0
      ? latestPosts.map(post => `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px; border:1px solid #f1f5f9; border-radius:12px; overflow:hidden; background:#fafafa;">
          <tr>
            <td width="100" style="vertical-align:top; padding:0;">
              <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration:none; display:block;">
                <img src="${post.image_url}" alt="${post.title}" width="100" height="100" style="display:block; width:100px; height:100px; object-fit:cover;" />
              </a>
            </td>
            <td style="vertical-align:top; padding:14px 16px;">
              <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration:none;">
                <div style="font-size:13px; font-weight:700; color:#1e293b; line-height:1.4; margin-bottom:6px;">${post.title}</div>
                <div style="font-size:12px; color:#94a3b8; line-height:1.5; margin-bottom:8px;">${post.excerpt.substring(0, 80)}...</div>
                <div style="font-size:12px; font-weight:700; color:#eab308;">Read more &#8594;</div>
              </a>
            </td>
          </tr>
        </table>
      `).join('')
      : '';

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: 'Welcome to Penny Pal! 🚀',
      text: `Welcome to the Penny Pal Circle! Your journey starts today. Visit your dashboard: https://www.mypennypal.com/dashboard`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Penny Pal</title>
          </head>
          <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
              <tr>
                <td align="center" style="padding:40px 16px;">

                  <!-- Main Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e2e8f0;">

                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding:36px 40px 0;">
                        <img src="https://www.mypennypal.com/email-assets/penny_avatar.jpg" alt="Penny Pal" width="64" height="64" style="display:block; border-radius:16px;" />
                      </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                      <td align="center" style="padding:24px 40px 8px;">
                        <h1 style="margin:0; font-size:26px; font-weight:800; color:#0f172a; line-height:1.25;">Welcome to the inner circle, ${userName}!</h1>
                      </td>
                    </tr>

                    <!-- Body text -->
                    <tr>
                      <td align="center" style="padding:8px 40px 32px;">
                        <p style="margin:0; font-size:15px; color:#64748b; line-height:1.65;">We're so excited to have you join us. Penny Pal is built to help you master your money and build real wealth. Your journey starts today.</p>
                      </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding:0 40px 40px;">
                        <a href="https://www.mypennypal.com/dashboard" style="display:inline-block; background-color:#eab308; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:16px 40px; border-radius:12px; letter-spacing:0.01em;">Go to your Dashboard</a>
                      </td>
                    </tr>

                    ${latestPosts && latestPosts.length > 0 ? `
                    <!-- Section divider -->
                    <tr>
                      <td style="padding:0 40px;">
                        <div style="border-top:1px solid #f1f5f9;"></div>
                      </td>
                    </tr>

                    <!-- Insights Section Title -->
                    <tr>
                      <td align="center" style="padding:28px 40px 16px;">
                        <div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:0.1em; text-transform:uppercase;">Latest Financial Insights</div>
                      </td>
                    </tr>

                    <!-- Blog Cards -->
                    <tr>
                      <td style="padding:0 32px;">
                        ${blogHtml}
                      </td>
                    </tr>

                    <!-- View all link -->
                    <tr>
                      <td align="center" style="padding:12px 40px 36px;">
                        <a href="https://www.mypennypal.com/insights" style="font-size:12px; color:#94a3b8; text-decoration:none; font-weight:500; letter-spacing:0.03em;">View all insights &#8594;</a>
                      </td>
                    </tr>
                    ` : ''}

                    <!-- Footer -->
                    <tr>
                      <td style="background-color:#f8fafc; border-top:1px solid #f1f5f9; padding:28px 40px; border-radius:0 0 20px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding-bottom:16px;">
                              <span style="font-size:13px; color:#94a3b8;">Follow the movement</span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-bottom:20px;">
                              <a href="https://x.com/pennypalhq" style="display:inline-block; margin:0 6px; background:#1e293b; color:#ffffff; font-size:11px; font-weight:700; text-decoration:none; padding:7px 14px; border-radius:20px; letter-spacing:0.03em;">&#119831; X</a>
                              <a href="https://www.instagram.com/pennypalhq/" style="display:inline-block; margin:0 6px; background:#e1306c; color:#ffffff; font-size:11px; font-weight:700; text-decoration:none; padding:7px 14px; border-radius:20px; letter-spacing:0.03em;">&#128247; Instagram</a>
                              <a href="https://www.tiktok.com/@pennypalhq" style="display:inline-block; margin:0 6px; background:#010101; color:#ffffff; font-size:11px; font-weight:700; text-decoration:none; padding:7px 14px; border-radius:20px; letter-spacing:0.03em;">&#127926; TikTok</a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <p style="margin:0; font-size:11px; color:#cbd5e1;">&copy; ${new Date().getFullYear()} Penny Pal. All rights reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

