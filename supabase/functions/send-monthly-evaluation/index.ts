// @ts-nocheck - Deno runtime file
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

  try {
    const body = await req.json().catch(() => ({}));
    const { email: testEmail, name: testName } = body;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('Missing RESEND_API_KEY');
    const resend = new Resend(resendApiKey);

    const SENDER_EMAIL = 'Penny Pal <support@mypennypal.com>';

    // Determine month and year to evaluate (prev month by default)
    const now = new Date();
    let targetMonth = now.getMonth(); // Current month index (0-11)
    let targetYear = now.getFullYear();

    // If it's the start of the month, we evaluate the previous month
    // For simplicity during testing, we'll use the month that just ended
    if (targetMonth === 0) {
      targetMonth = 12;
      targetYear -= 1;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const displayMonth = monthNames[targetMonth - 1] || monthNames[11];

    // 1. Fetch latest blog posts for the insights section
    const { data: latestPosts } = await supabaseClient
      .from('blog_posts')
      .select('title, slug, excerpt, image_url')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(2);

    // Blog post cards helper
    const blogHtml = latestPosts && latestPosts.length > 0
      ? latestPosts.map(post => `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px; border:1px solid #f8fafc; border-radius:12px; overflow:hidden; background:#ffffff;">
                    <tr>
                        <td width="100" style="vertical-align:top; padding:0;">
                            <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration:none; display:block;">
                                <img src="${post.image_url}" alt="${post.title}" width="100" height="100" style="display:block; width:100px; height:100px; object-fit:cover;" />
                            </a>
                        </td>
                        <td style="vertical-align:middle; padding:12px 16px;">
                            <a href="https://www.mypennypal.com/insights/${post.slug}" style="text-decoration:none;">
                                <div style="font-size:13px; font-weight:700; color:#1e293b; line-height:1.3; margin-bottom:4px;">${post.title}</div>
                                <div style="font-size:11px; color:#64748b; line-height:1.4; margin-bottom:6px;">${post.excerpt.substring(0, 65)}...</div>
                                <div style="font-size:11px; font-weight:700; color:#eab308;">Read more &#8594;</div>
                            </a>
                        </td>
                    </tr>
                </table>
            `).join('')
      : '';

    let usersToProcess = [];

    if (testEmail) {
      console.log(`Test mode: sending to ${testEmail}`);
      // Find user if they exist to get real data
      const { data: { users: foundUsers } } = await supabaseClient.auth.admin.listUsers();
      const existingUser = foundUsers.find(u => u.email === testEmail);

      usersToProcess = [{
        id: existingUser?.id || 'test-id',
        email: testEmail,
        user_metadata: {
          preferred_name: testName || existingUser?.user_metadata?.preferred_name || 'Test User',
          currency: existingUser?.user_metadata?.currency || 'GHS'
        },
        isTest: !existingUser
      }];
    } else {
      const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers();
      if (userError) throw userError;
      usersToProcess = users;
    }

    let successCount = 0;
    let skipCount = 0;

    for (const user of usersToProcess) {
      if (!user.email) continue;

      // 3. Fetch monthly summary for this user
      let summary;

      if (user.isTest) {
        // Mock data for design testing
        summary = {
          balance: 2450.75,
          income: 5000.00,
          expenses: 2549.25
        };
      } else {
        const { data } = await supabaseClient
          .from('monthly_summaries')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', targetMonth)
          .eq('year', targetYear)
          .single();
        summary = data;
      }

      // Only send if they have activity (or if it's a test)
      if (!summary) {
        skipCount++;
        continue;
      }

      const userName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || 'there';
      const currency = user.user_metadata?.currency || 'GHS';

      const formatCurrency = (val: number) => {
        const currencyCode = currency.split(' ')[0] || 'GHS';
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: currencyCode }).format(val);
      };

      await resend.emails.send({
        from: SENDER_EMAIL,
        to: [user.email],
        subject: `Your ${displayMonth} Financial Report is ready! 📊`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
              <tr>
                <td align="center" style="padding:32px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding:32px 40px 0;">
                        <img src="https://www.mypennypal.com/email-assets/penny_avatar.jpg" alt="Penny Pal" width="56" height="56" style="display:block; border-radius:12px;" />
                      </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                      <td align="center" style="padding:20px 40px 4px;">
                        <h1 style="margin:0; font-size:20px; font-weight:800; color:#0f172a; line-height:1.2;">Your ${displayMonth} Snapshot</h1>
                      </td>
                    </tr>

                    <!-- Intro -->
                    <tr>
                      <td align="center" style="padding:4px 40px 24px;">
                        <p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">Hi ${userName}, here's a quick look at your activity for the month of ${displayMonth}. Every cedi tracked is a step toward your freedom!</p>
                      </td>
                    </tr>

                    <!-- Stats Grid -->
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border-radius:16px; border:1px solid #f1f5f9;">
                          <tr>
                            <td style="padding:20px; text-align:center; border-bottom:1px solid #f1f5f9;">
                              <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.05em;">${displayMonth} Net Savings</div>
                              <div style="font-size:24px; font-weight:800; color:#0f172a;">${formatCurrency(summary.income - summary.expenses)}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td width="50%" style="padding:16px; text-align:center; border-right:1px solid #f1f5f9;">
                                    <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Income</div>
                                    <div style="font-size:16px; font-weight:700; color:#16a34a;">+${formatCurrency(summary.income)}</div>
                                  </td>
                                  <td width="50%" style="padding:16px; text-align:center;">
                                    <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Expenses</div>
                                    <div style="font-size:16px; font-weight:700; color:#ef4444;">-${formatCurrency(summary.expenses)}</div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                      <td align="center" style="padding:0 40px 40px;">
                        <a href="https://www.mypennypal.com/dashboard" style="display:inline-block; background-color:#eab308; color:#ffffff; font-size:13px; font-weight:700; text-decoration:none; padding:12px 32px; border-radius:12px;">Full Breakdown in Dashboard</a>
                      </td>
                    </tr>

                    ${blogHtml ? `
                    <!-- Insights Section -->
                    <tr><td style="padding:0 40px;"><div style="border-top:1px solid #f1f5f9;"></div></td></tr>
                    <tr><td align="center" style="padding:24px 40px 16px;"><div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:0.1em; text-transform:uppercase;">Financial Insights for You</div></td></tr>
                    <tr><td style="padding:0 40px;">${blogHtml}</td></tr>
                    ` : ''}

                    <!-- Footer Socials -->
                    <tr>
                      <td align="center" style="padding:32px 40px 48px; background:#fafafa;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding-bottom:12px;">
                              <span style="font-size:13px; font-weight:600; color:#475569;">Follow the community</span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <a href="https://x.com/pennypalhq" style="display:inline-block; margin:0 8px; background:#ffffff; border:1px solid #e2e8f0; width:40px; height:40px; line-height:40px; border-radius:50%; text-align:center; text-decoration:none;">
                                <img src="https://www.mypennypal.com/email-assets/x_icon.png" width="18" height="18" style="vertical-align:middle; display:inline-block;" />
                              </a>
                              <a href="https://www.instagram.com/pennypalhq/" style="display:inline-block; margin:0 8px; background:#ffffff; border:1px solid #e2e8f0; width:40px; height:40px; line-height:40px; border-radius:50%; text-align:center; text-decoration:none;">
                                <img src="https://www.mypennypal.com/email-assets/insta_icon.png" width="18" height="18" style="vertical-align:middle; display:inline-block;" />
                              </a>
                              <a href="https://www.tiktok.com/@pennypalhq" style="display:inline-block; margin:0 8px; background:#ffffff; border:1px solid #e2e8f0; width:40px; height:40px; line-height:40px; border-radius:50%; text-align:center; text-decoration:none;">
                                <img src="https://www.mypennypal.com/email-assets/tiktok_icon.png" width="18" height="18" style="vertical-align:middle; display:inline-block;" />
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:20px 0 0; font-size:12px; color:#94a3b8; line-height:1.5;">&copy; ${now.getFullYear()} Penny Pal. All rights reserved.</p>
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
      successCount++;
    }

    return new Response(JSON.stringify({ success: successCount, skipped: skipCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
