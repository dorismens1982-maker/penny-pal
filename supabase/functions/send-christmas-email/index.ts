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

        // Check for API Key
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error('Missing RESEND_API_KEY');
        }

        const resend = new Resend(resendApiKey);

        // CONFIGURATION
        // TODO: Replace with your custom domain email after verifying it in Resend
        // Example: 'Penny Pal <hello@penny-pal.com>'
        const SENDER_EMAIL = 'Penny Pal <hello@mypennypa.com>';
        const CATCH_UP_DATE = '2025-12-25T09:00:00Z'; // Users who signed up after this time

        // 1. Fetch users
        const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (userError) throw userError;

        // 2. Filter for Gmail AND New Users (Catch-up)
        const gmailUsers = users.filter(user =>
            user.email &&
            user.email.toLowerCase().endsWith('@gmail.com') &&
            new Date(user.created_at) > new Date(CATCH_UP_DATE)
        );

        console.log(`Found ${users.length} total users. Catch-up mode: ${gmailUsers.length} new users since ${CATCH_UP_DATE}.`);

        // 3. Send Emails (Batch or Loop)
        // For safety/rate limits, we'll loop (Resend has batch endpoints too, but let's keep it simple for this script)
        const results: EmailResponse = { success: 0, failed: 0, errors: [] };

        // Use loop
        for (const user of gmailUsers) {
            if (!user.email) continue;

            // Rate Limit Protection: Wait 1 second between emails (Resend limit is ~2/sec)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Try to get a name: preferred_name -> full_name -> 'there'
            const userName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || 'Friend';

            try {
                const { data, error } = await resend.emails.send({
                    from: SENDER_EMAIL, // Updated to use constant
                    to: [user.email],
                    subject: 'Merry Christmas from Penny Pal! 🎄',
                    text: `Merry Christmas! 
                    
Hi ${userName}, 

Sending you warm wishes for a joyful holiday season. May your days be filled with peace, hope, and financial wellness!

With love,
The Penny Pal Team`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
              <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Logo -->
                <div style="text-align: center; padding: 20px 0; background-color: #ffffff;">
                  <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/v1765476493/penny_avatar_jffsr9.jpg" alt="Penny Pal" style="width: 50px; height: 50px; border-radius: 50%; display: inline-block;" />
                </div>

                <!-- Header Image -->
                <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/v1766620025/christmas-card-simple_hokyoe.jpg" alt="Merry Christmas" style="width: 100%; height: auto; display: block;" />
                
                <!-- Content -->
                <div style="padding: 30px; text-align: center;">
                  <h1 style="color: #b91c1c; margin-bottom: 10px;">Merry Christmas!</h1>
                  <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                    Hi ${userName}, <br/><br/>
                    Sending you warm wishes for a joyful holiday season. May your days be filled with peace, hope, and financial wellness!
                  </p>
                  <p style="color: #6b7280; font-size: 14px;">
                    With love,<br/>
                    The Penny Pal Team
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
