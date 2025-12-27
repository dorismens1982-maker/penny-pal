// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
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

        // CONFIGURATION
        const SENDER_EMAIL = 'Penny Pal <hello@mypennypa.com>';
        const userName = name || 'Friend';

        console.log(`Sending Welcome Email to ${email} (${userName})`);

        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [email],
            subject: 'Welcome to Penny Pal! 🚀',
            text: `Welcome to Penny Pal!

Hi ${userName},

We are thrilled to have you on board. Penny Pal is here to help you achieve financial wellness and freedom.

If you have any questions, feel free to reply to this email.

Happy tracking!
The Penny Pal Team`,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
              <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Logo -->
                <div style="text-align: center; padding: 20px 0; background-color: #ffffff;">
                  <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/v1765476493/penny_avatar_jffsr9.jpg" alt="Penny Pal" style="width: 50px; height: 50px; border-radius: 50%; display: inline-block;" />
                </div>

                <!-- Hero Image (optional, using logo for now or general vibe) -->
                <div style="background-color: #dc2626; padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Penny Pal!</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px; text-align: center;">
                  <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                    Hi <strong>${userName}</strong>, <br/><br/>
                    We are thrilled to have you on board. <br/>
                    Penny Pal is here to help you achieve financial wellness and freedom.
                  </p>
                  
                  <div style="margin: 30px 0;">
                    <a href="https://penny-pal.netlify.app" style="background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px;">
                    Happy tracking,<br/>
                    The Penny Pal Team
                  </p>
                </div>
              </div>
            </div>
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

