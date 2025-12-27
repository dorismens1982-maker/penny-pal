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
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Check for Resend API Key
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error('Missing RESEND_API_KEY');
        }

        const resend = new Resend(resendApiKey);
        const SENDER_EMAIL = 'Penny Pal <hello@mypennypa.com>';

        // Get date range for last week
        const today = new Date();
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - today.getDay() - 6); // Last Monday
        lastMonday.setHours(0, 0, 0, 0);

        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6); // Last Sunday
        lastSunday.setHours(23, 59, 59, 999);

        const startDate = lastMonday.toISOString().split('T')[0];
        const endDate = lastSunday.toISOString().split('T')[0];

        console.log(`Fetching weekly summaries for ${startDate} to ${endDate}`);

        // Get all active users (logged in within last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('user_id, preferred_name, currency')
            .gte('created_at', fourteenDaysAgo.toISOString());

        if (usersError) throw usersError;

        console.log(`Found ${users?.length || 0} active users`);

        let emailsSent = 0;
        let emailsFailed = 0;

        // Process each user
        for (const user of users || []) {
            try {
                // Get user's email from auth
                const email = ((authUser.user.email as any) || '').toString();
                const userName = user.preferred_name || 'Friend';

                // Generate motivational tip
                const tips = [
                    "Small steps lead to big financial goals. Keep going!",
                    "Did you know? Tracking every penny helps you save more in the long run.",
                    "Take a moment to review your budget this week.",
                    "Financial freedom starts with understanding your spending.",
                    "A budget is telling your money where to go instead of wondering where it went."
                ];
                const randomTip = tips[Math.floor(Math.random() * tips.length)];

                // Send email
                const { error: emailError } = await resend.emails.send({
                    from: SENDER_EMAIL,
                    to: [email],
                    subject: `Your Weekly Motivation 🚀 - ${userName}`,
                    text: `Hi ${userName},

Hope you're having a great start to your week!

THIS WEEK'S MOTIVATION
${randomTip}

Remember to log your transactions to keep your financial health in check.

Happy tracking!
The Penny Pal Team`,
                    html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
                      <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; padding: 20px 0; background-color: #ffffff;">
                          <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/v1765476493/penny_avatar_jffsr9.jpg" alt="Penny Pal" style="width: 50px; height: 50px; border-radius: 50%; display: inline-block;" />
                        </div>

                        <!-- Header -->
                        <div style="background-color: #eab308; padding: 30px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Your Weekly Boost 🚀</h1>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 30px 20px;">
                          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                            Hi <strong>${userName}</strong>,
                          </p>

                          <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
                            Hope you're ready to conquer your financial goals this week!
                          </p>

                          <!-- Tip -->
                          <div style="background-color: #fef3c7; border-left: 4px solid #eab308; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                            <h3 style="color: #92400e; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">🎯 THIS WEEK'S MOTIVATION</h3>
                            <p style="color: #78350f; font-size: 14px; margin: 0;">${randomTip}</p>
                          </div>

                          <p style="color: #374151; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
                            Remember, consistency is key. Take a moment to log any missing transactions from the weekend.
                          </p>

                          <!-- CTA -->
                          <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.mypennypa.com" style="background-color: #eab308; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                          </div>

                          <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            Happy tracking!<br/>
                            The Penny Pal Team
                          </p>
                        </div>
                      </div>
                    </div>
                    `
                });

                if (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                    emailsFailed++;
                } else {
                    console.log(`✓ Sent weekly motivation to ${email}`);
                    emailsSent++;
                }

            } catch (userError) {
                console.error(`Error processing user ${user.user_id}:`, userError);
                emailsFailed++;
            }
        }

        return new Response(
            JSON.stringify({
                message: 'Weekly summary emails processed',
                sent: emailsSent,
                failed: emailsFailed,
                total: users?.length || 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
