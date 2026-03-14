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

  // ✅ Relaxed Auth: Accept either a Bearer JWT (existing session) OR the Supabase anon/service key.
  // This allows the function to be called immediately after email sign-up (before the session exists).
  const authHeader = req.headers.get('Authorization') || '';
  const apiKey = req.headers.get('apikey') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  const hasBearer = authHeader.startsWith('Bearer ');
  const hasValidAnonKey = apiKey !== '' && apiKey === supabaseAnonKey;

  if (!hasBearer && !hasValidAnonKey) {
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

    // Fetch 3 latest published blog posts
    const { data: latestPosts } = await supabaseClient
      .from('blog_posts')
      .select('title, slug, excerpt, image_url')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3);

    // CONFIGURATION
    const SENDER_EMAIL = 'Penny Pal <support@mypennypal.com>';
    const userName = name || 'Friend';

    console.log(`Sending Welcome Email to ${email} (${userName})`);

    // Blog post cards — table-based, works in all email clients including Gmail
    const blogHtml = latestPosts && latestPosts.length > 0
      ? latestPosts.map(post => `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px; border:1px solid #f1f5f9; border-radius:12px; overflow:hidden; background:#ffffff;">
          <tr>
            <td width="100" style="vertical-align:top; padding:0;">
              <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration:none; display:block;">
                <img src="${post.image_url}" alt="${post.title}" width="100" height="100" style="display:block; width:100px; height:100px; object-fit:cover;" />
              </a>
            </td>
            <td style="vertical-align:middle; padding:12px 16px;">
              <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration:none;">
                <div style="font-size:13px; font-weight:700; color:#1e293b; line-height:1.3; margin-bottom:4px;">${post.title}</div>
                <div style="font-size:11px; color:#64748b; line-height:1.4; margin-bottom:6px;">${(post.excerpt || '').substring(0, 70)}...</div>
                <div style="font-size:11px; font-weight:700; color:#eab308;">Read more &#8594;</div>
              </a>
            </td>
          </tr>
        </table>
      `).join('')
      : '';

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: `Welcome to Penny Pal, ${userName}! 🚀`,
      text: `Welcome to the Penny Pal Circle! Your journey to financial freedom starts today. Visit your dashboard: https://www.mypennypal.com/manage`,
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
                <td align="center" style="padding:32px 16px;">

                  <!-- Main Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding:32px 40px 0;">
                        <img src="https://www.mypennypal.com/email-assets/penny_avatar.jpg" alt="Penny Pal" width="56" height="56" style="display:block; border-radius:12px;" />
                      </td>
                    </tr>

                    <!-- Badge -->
                    <tr>
                      <td align="center" style="padding:16px 40px 0;">
                        <div style="display:inline-block; background-color:#fef9c3; color:#854d0e; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 14px; border-radius:100px;">You're in the circle 🎉</div>
                      </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                      <td align="center" style="padding:16px 40px 4px;">
                        <h1 style="margin:0; font-size:24px; font-weight:800; color:#0f172a; line-height:1.2;">Welcome, ${userName}!</h1>
                      </td>
                    </tr>

                    <!-- Body text -->
                    <tr>
                      <td align="center" style="padding:8px 40px 28px;">
                        <p style="margin:0; font-size:14px; color:#475569; line-height:1.7;">We're so excited to have you join us. Penny Pal is built to help you master your money and build real wealth — starting today. Your dashboard is ready and waiting. 💰</p>
                      </td>
                    </tr>

                    <!-- CTA Buttons -->
                    <tr>
                      <td align="center" style="padding:0 40px 40px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding-right:8px;">
                              <a href="https://www.mypennypal.com/manage" style="display:inline-block; background-color:#eab308; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none; padding:13px 28px; border-radius:12px; letter-spacing:0.01em;">Go to Dashboard</a>
                            </td>
                            <td>
                              <a href="https://www.mypennypal.com/insights" style="display:inline-block; background-color:#f8fafc; color:#334155; font-size:14px; font-weight:600; text-decoration:none; padding:13px 28px; border-radius:12px; border:1px solid #e2e8f0;">Explore Insights</a>
                            </td>
                          </tr>
                        </table>
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
                      <td align="center" style="padding:24px 40px 16px;">
                        <div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:0.1em; text-transform:uppercase;">Start Reading — Fresh From the Blog</div>
                      </td>
                    </tr>

                    <!-- Blog Cards -->
                    <tr>
                      <td style="padding:0 40px;">
                        ${blogHtml}
                      </td>
                    </tr>

                    <!-- View all link -->
                    <tr>
                      <td align="center" style="padding:8px 40px 48px;">
                        <a href="https://www.mypennypal.com/insights" style="font-size:13px; color:#eab308; text-decoration:none; font-weight:700; letter-spacing:0.01em;">View all insights &#8594;</a>
                      </td>
                    </tr>
                    ` : ''}

                    <!-- What's next section -->
                    <tr>
                      <td style="padding:0 40px;">
                        <div style="border-top:1px solid #f1f5f9;"></div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 40px 32px;">
                        <div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:0.1em; text-transform:uppercase; text-align:center; margin-bottom:16px;">Get the most out of Penny Pal</div>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding:8px 8px 8px 0; vertical-align:top; width:33%;">
                              <div style="text-align:center;">
                                <div style="font-size:20px; margin-bottom:6px;">📊</div>
                                <div style="font-size:11px; font-weight:700; color:#1e293b; margin-bottom:3px;">Track Expenses</div>
                                <div style="font-size:10px; color:#64748b; line-height:1.4;">Log income & expenses in seconds</div>
                              </div>
                            </td>
                            <td style="padding:8px; vertical-align:top; width:33%;">
                              <div style="text-align:center;">
                                <div style="font-size:20px; margin-bottom:6px;">📰</div>
                                <div style="font-size:11px; font-weight:700; color:#1e293b; margin-bottom:3px;">Read Insights</div>
                                <div style="font-size:10px; color:#64748b; line-height:1.4;">Expert tips tailored for Ghana</div>
                              </div>
                            </td>
                            <td style="padding:8px 0 8px 8px; vertical-align:top; width:33%;">
                              <div style="text-align:center;">
                                <div style="font-size:20px; margin-bottom:6px;">💬</div>
                                <div style="font-size:11px; font-weight:700; color:#1e293b; margin-bottom:3px;">Join Community</div>
                                <div style="font-size:10px; color:#64748b; line-height:1.4;">Share strategies with others</div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color:#f8fafc; border-top:1px solid #f1f5f9; padding:32px 40px; border-radius:0 0 24px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding-bottom:12px;">
                              <span style="font-size:13px; font-weight:600; color:#475569;">Follow the community</span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-bottom:20px;">
                              <!-- X (Twitter) -->
                              <a href="https://x.com/pennypalhq" style="display:inline-block; margin:0 6px; background:#ffffff; border:1px solid #e2e8f0; width:38px; height:38px; line-height:38px; border-radius:50%; text-align:center; text-decoration:none;">
                                <img src="https://www.mypennypal.com/email-assets/x_icon.png" width="16" height="16" style="vertical-align:middle; display:inline-block;" />
                              </a>
                              <!-- Instagram -->
                              <a href="https://www.instagram.com/pennypalhq/" style="display:inline-block; margin:0 6px; background:#ffffff; border:1px solid #e2e8f0; width:38px; height:38px; line-height:38px; border-radius:50%; text-align:center; text-decoration:none;">
                                <img src="https://www.mypennypal.com/email-assets/insta_icon.png" width="16" height="16" style="vertical-align:middle; display:inline-block;" />
                              </a>
                              <!-- TikTok -->
                              <a href="https://www.tiktok.com/@pennypalhq" style="display:inline-block; margin:0 6px; background:#ffffff; border:1px solid #e2e8f0; width:38px; height:38px; line-height:38px; border-radius:50%; text-align:center; text-decoration:none;">
                                <img src="https://www.mypennypal.com/email-assets/tiktok_icon.png" width="16" height="16" style="vertical-align:middle; display:inline-block;" />
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <p style="margin:0; font-size:11px; color:#94a3b8; line-height:1.5;">&copy; ${new Date().getFullYear()} Penny Pal. All rights reserved.<br>You received this because you joined Penny Pal.</p>
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
