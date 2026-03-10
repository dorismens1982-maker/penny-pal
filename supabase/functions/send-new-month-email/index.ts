// @ts-nocheck - Deno runtime file: TS errors here are false positives (VS Code has no Deno extension)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const ALLOWED_ORIGINS = ['https://mypennypal.com', 'https://www.mypennypal.com'];
const getCorsHeaders = (req) => {
    const origin = req.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
};

interface EmailResponse {
    success: number;
    failed: number;
    errors: any[];
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) })
    }
    const corsHeaders = getCorsHeaders(req);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
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
        const SENDER_EMAIL = 'Penny Pal <support@mypennypal.com>';

        // Use the Cloudinary URL for the generated image
        const IMG_URL = 'https://www.mypennypal.com/email-assets/ghana_month_header.png';

        // 1. Fetch ALL users
        const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (userError) throw userError;

        console.log(`Found ${users.length} total users.`);

        // 2. Filter Users - SEND TO EVERYONE WITH AN EMAIL
        const targetUsers = users.filter(user => user.email);

        console.log(`Target users: ${targetUsers.length}. Sending Ghana Month email to all users...`);

        const results: EmailResponse = { success: 0, failed: 0, errors: [] };

        // 3. Send Emails
        for (const user of targetUsers) {
            if (!user.email) continue;

            // Rate Limit Protection: Wait 500ms between emails
            await new Promise(resolve => setTimeout(resolve, 500));

            const userName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || 'Friend';

            try {
                const { data, error } = await resend.emails.send({
                    from: SENDER_EMAIL,
                    to: [user.email],
                    subject: 'Happy New Month! 🇬🇭 Celebrate Financial Freedom & Ghana Month!',
                    text: `Happy New Month, ${userName}!\n\nWelcome to March – our proud Ghana Month! 🇬🇭\n\nAs we celebrate our rich heritage and independence this month, let it also be a reminder of your journey toward financial independence. Keep tracking, keep saving, and keep reaching for those goals.\n\nAkwaaba to a new month of prosperity!\n\nWith love,\nThe Penny Pal Team`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
              <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                


                <!-- Header Image Placeholder - update the IMG_URL variable -->
                <img src="${IMG_URL}" alt="Happy Ghana Month!" style="width: 100%; height: auto; display: block;" />
                
                <!-- Content -->
                <div style="padding: 30px; text-align: center;">
                  <h1 style="color: #16a34a; margin-bottom: 15px; font-size: 26px;">Happy New Month! 🇬🇭</h1>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hi <strong>${userName}</strong>, <br/><br/>
                    Welcome to <strong>March!</strong>
                    <br/><br/>
                    As we celebrate our rich culture, heritage, and independence this month, let it also be a powerful reminder of your own journey toward financial independence. 
                    <br/><br/>
                    Every logged expense and saved cedi is a step toward true freedom. Keep tracking, keep growing, and let's make this month count!
                  </p>
                  
                  <div style="margin: 35px 0;">
                    <a href="https://www.mypennypal.com" style="background-color: #eab308; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Track Your Finances</a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Akwaaba 🇬🇭 to a month of prosperity!<br/>
                    <strong>The Penny Pal Team</strong>
                  </p>
                  
                  <!-- Logo -->
                  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f3f4f6; margin-top: 20px;">
                     <img src="https://www.mypennypal.com/email-assets/penny_avatar.jpg" alt="Penny Pal" style="width: 40px; height: 40px; border-radius: 50%; display: inline-block;" />
                  </div>
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
                message: 'Ghana Month campaign completed',
                debug: {
                    totalUsers: users.length,
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
