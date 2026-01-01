// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailResponse {
    success: number;
    failed: number;
    errors: any[];
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
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
        if (!resendApiKey) {
            throw new Error('Missing RESEND_API_KEY');
        }

        const resend = new Resend(resendApiKey);

        // CONFIGURATION
        const SENDER_EMAIL = 'Penny Pal <hello@mypennypa.com>'; // Keeping consistent with existing functions
        const IMG_URL = 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1767237469/new-year-card_xh6evr.jpg';

        // 1. Fetch ALL users
        const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Supabase limit is usually 50 or 1000 depending on tier, consider pagination for very large bases
        });

        if (userError) throw userError;

        console.log(`Found ${users.length} total users.`);

        // 2. Filter Users (Optional: currently logic sends to ALL valid emails)
        // PRODUCTION MODE: Send to all users with email
        const targetUsers = users.filter(user => user.email);

        const results: EmailResponse = { success: 0, failed: 0, errors: [] };

        // 3. Send Emails
        for (const user of targetUsers) {
            if (!user.email) continue;

            // Rate Limit Protection: Wait 0.5s (2 emails/sec is safe for Resend free tier, adjust as needed)
            await new Promise(resolve => setTimeout(resolve, 500));

            const userName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || 'Friend';

            try {
                const { data, error } = await resend.emails.send({
                    from: SENDER_EMAIL,
                    to: [user.email],
                    subject: 'Happy New Year 2026 from Penny Pal! 🥂',
                    text: `Happy New Year!
                    
Hi ${userName},

Wishing you a prosperous 2026 filled with growth and financial wellness. Thank you for being with us!

With love,
The Penny Pal Team`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
              <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                
                <!-- Logo -->
                <div style="text-align: center; padding: 20px 0; background-color: #ffffff;">
                   <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/v1765476493/penny_avatar_jffsr9.jpg" alt="Penny Pal" style="width: 50px; height: 50px; border-radius: 50%; display: inline-block;" />
                </div>

                <!-- Header Image -->
                <img src="${IMG_URL}" alt="Happy New Year 2026" style="width: 100%; height: auto; display: block;" />
                
                <!-- Content -->
                <div style="padding: 30px; text-align: center;">
                  <h1 style="color: #d97706; margin-bottom: 10px; font-family: serif;">Happy New Year!</h1>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hi <strong>${userName}</strong>, <br/><br/>
                    As we step into 2026, we want to wish you a year filled with growth, prosperity, and financial wellness. ✨
                    <br/><br/>
                    Thank you for letting us be a part of your journey. Let's make this year count!
                  </p>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    With love,<br/>
                    <strong>The Penny Pal Team</strong>
                  </p>
                </div>
              </div>
            </div>
          `
                });

                if (error) {
                    console.error(`Failed to send to ${user.email}:`, error);
                    results.failed++;
                    results.errors.push({ email: user.email, error });
                } else {
                    console.log(`Sent to ${user.email}`);
                    results.success++;
                }
            } catch (err) {
                console.error(`Exception sending to ${user.email}:`, err);
                results.failed++;
            }
        }

        return new Response(
            JSON.stringify({
                message: 'Campaign completed',
                debug: {
                    totalUsers: users.length,
                    targetEmail: 'bigsamcreates@gmail.com',
                    matchedUsers: targetUsers.length
                },
                stats: results
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            },
        )
    }
})
