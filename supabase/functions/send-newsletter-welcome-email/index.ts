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

    // CONFIGURATION
    const SENDER_EMAIL = 'Penny Pal <support@mypennypal.com>';

    console.log(`Sending Newsletter Welcome Email to ${email}`);

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: 'Welcome to the Penny Pal Newsletter! 🚀',
      text: `Welcome to the Penny Pal Circle! 🚀

Hi there,

We're thrilled to have you join our community. You've officially taken a step towards smarter personal finance.

What to expect:
- Weekly financial insights delivered fresh
- Exclusive tips for building wealth in cedis
- Early access to new platform features

Ready to start your journey? Visit the Hub here: https://www.mypennypal.com/insights

Follow us:
X: https://x.com/pennypalhq
Instagram: https://www.instagram.com/pennypalhq/
TikTok: https://www.tiktok.com/@pennypalhq

Happy tracking!
The Penny Pal Team`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .header { padding: 40px 20px; text-align: center; background-color: #ffffff; }
              .hero { position: relative; background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 60px 20px; text-align: center; color: #ffffff; }
              .hero h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.2; }
              .content { padding: 40px 32px; text-align: center; line-height: 1.6; }
              .content p { font-size: 16px; color: #475569; margin-bottom: 24px; }
              .button { display: inline-block; background-color: #eab308; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(234, 179, 8, 0.3); }
              .features { background-color: #fdfaf0; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; }
              .feature-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 14px; font-weight: 500; color: #854d0e; }
              .feature-item span { margin-right: 12px; font-size: 18px; }
              .socials { padding: 32px; text-align: center; background-color: #fafafa; border-top: 1px solid #f1f5f9; }
              .social-link { display: inline-block; margin: 0 12px; text-decoration: none; opacity: 0.6; transition: opacity 0.2s; }
              .footer { padding: 32px; text-align: center; font-size: 12px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/v1765476493/penny_avatar_jffsr9.jpg" alt="Penny Pal" style="width: 56px; height: 56px; border-radius: 50%;" />
              </div>
              
              <div class="hero">
                <h1>You're in! <br/> Welcome to the Circle.</h1>
              </div>
              
              <div class="content">
                <p>Hello! We're thrilled to have you join our community. You've officially taken a step towards smarter personal finance.</p>
                
                <div class="features">
                  <div class="feature-item"><span>🚀</span> Weekly financial insights delivered fresh</div>
                  <div class="feature-item"><span>💡</span> Exclusive tips for building wealth in cedis</div>
                  <div class="feature-item"><span>🔥</span> Early access to new platform features</div>
                </div>
                
                <p>Ready to start your journey? Check out our latest insights on the blog.</p>
                
                <div style="margin: 40px 0;">
                  <a href="https://www.mypennypal.com/insights" class="button">Visit The Hub</a>
                </div>
              </div>
              
              <div class="socials">
                <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Follow the movement</p>
                <a href="https://x.com/pennypalhq" class="social-link"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" height="20" alt="X" /></a>
                <a href="https://www.instagram.com/pennypalhq/" class="social-link"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" height="20" alt="Instagram" /></a>
                <a href="https://www.tiktok.com/@pennypalhq" class="social-link"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="20" height="20" alt="TikTok" /></a>
              </div>
              
              <div class="footer">
                <p>&copy; 2026 Penny Pal. All rights reserved.</p>
                <p>If you didn't subscribe, you can <a href="#" style="color: #94a3b8;">unsubscribe anytime</a>.</p>
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
