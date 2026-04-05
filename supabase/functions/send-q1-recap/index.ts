// @ts-nocheck - Deno runtime file
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
    const body = await req.json();
    const { testEmail, isTestRun = false } = body;

    // Supabase Setup
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Resend Setup
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resend = new Resend(resendApiKey);

    // 1. Get targets (either test email or all users with profiles)
    let users = [];
    if (testEmail) {
      // Find the auth user first to get their ID
      const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers({
        perPage: 1000 // Get all users (up to 1000) to find the test email
      });
      if (userError) throw userError;

      const testUser = userData?.users.find(u => u.email?.toLowerCase() === testEmail.toLowerCase());
      
      if (!testUser) {
        return new Response(JSON.stringify({ error: `User with email ${testEmail} not found in Auth` }), { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('user_id, preferred_name, currency')
        .eq('user_id', testUser.id)
        .maybeSingle();

      if (!profile) {
        return new Response(JSON.stringify({ error: `No profile record found for user ID ${testUser.id}` }), { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      users = [{ ...profile, email: testEmail }];
    } else {
      // --- MASS EMAIL LOGIC ---
      // 1. Get all profiles
      const { data: profiles, error: pError } = await supabaseClient
        .from('profiles')
        .select('user_id, preferred_name, currency');
      if (pError) throw pError;

      // 2. Map emails from Auth to profiles
      const { data: authData, error: aError } = await supabaseClient.auth.admin.listUsers({ perPage: 1000 });
      if (aError) throw aError;

      const emailMap = new Map(authData.users.map(u => [u.id, u.email]));
      
      users = profiles
        .map(p => ({ ...p, email: emailMap.get(p.user_id) }))
        .filter(u => u.email); // Only users with emails
    }

    const results = [];

    for (const userProfile of users) {
      if (!userProfile.user_id) continue;

      // 2. Fetch Q1 2026 Summaries (Jan, Feb, Mar)
      const { data: summaries, error: sError } = await supabaseClient
        .from('monthly_summaries')
        .select('month, year, income, expenses, balance, transaction_count')
        .eq('user_id', userProfile.user_id)
        .eq('year', 2026)
        .in('month', [1, 2, 3]);

      if (sError) {
        results.push({ email: userProfile.email, status: 'error', error: sError.message });
        continue;
      }

      // 3. Calculate Stats & Determine Flow
      const totalTransactions = summaries.reduce((sum, s) => sum + (s.transaction_count || 0), 0);
      const totalIncome = summaries.reduce((sum, s) => sum + (s.income || 0), 0);
      const totalExpenses = summaries.reduce((sum, s) => sum + (s.expenses || 0), 0);
      const totalTracked = totalIncome + totalExpenses;

      let emailHtml = '';
      let subject = '';

      if (totalTransactions === 0) {
        // --- INSPIRATION FLOW (No transactions) ---
        subject = "New Quarter, New Habits! 📈";
        emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Start Your Q2 with PennyPal</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; }
        .main { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { background-color: #4F46E5; padding: 40px 20px; text-align: center; }
        .logo { font-weight: 800; font-size: 28px; color: #ffffff; text-decoration: none; }
        .content { padding: 40px 30px; color: #21262D; }
        .icon { font-size: 48px; margin-bottom: 24px; display: block; text-align: center; }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 16px; text-align: center; }
        p { font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
        .highlight-box { background-color: #EEF2FF; border-left: 4px solid #4F46E5; padding: 20px; margin-bottom: 32px; border-radius: 0 12px 12px 0; }
        .button { background-color: #4F46E5; color: #ffffff !important; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; }
        .footer { text-align: center; padding: 24px; font-size: 14px; color: #9CA3AF; }
    </style>
</head>
<body>
    <div class="main">
        <div class="header"><div class="logo">PennyPal</div></div>
        <div class="content">
            <span class="icon">🚀</span>
            <h1>Make Q2 Your Smartest Yet, ${userProfile.preferred_name || 'Friend'}!</h1>
            <p>Q1 2026 has come to an end. While you haven't tracked your finances this quarter, every new day is a fresh opportunity to build a habit that your future self will thank you for.</p>
            <div class="highlight-box">
                <strong>Why start today?</strong><br/>
                Tracking your income and expenses is the first step to financial freedom. Most users feel 50% more in control of their spending within just one week of consistent tracking.
            </div>
            <p>Don’t let your expenses run wild in Q2. Start now and take data-driven control of your money.</p>
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://mypennypal.com/manage" class="button">Track My First Q2 Transaction</a>
            </div>
        </div>
        <div class="footer"><p>&copy; 2026 PennyPal • Your partner in financial clarity.</p></div>
    </div>
</body>
</html>`;
      } else {
        // --- RECAP FLOW (Has transactions) ---
        subject = "Your Q1 PennyPal Recap 📈";
        const bestMonth = summaries.reduce((prev, curr) => (curr.balance > prev.balance ? curr : prev), summaries[0] || { balance: 0, month: 3 });
        const monthNames = ["", "January", "February", "March"];
        const smartestMove = `Staying consistent in ${monthNames[bestMonth.month]}`;
        
        emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Q1 PennyPal Recap</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; }
        .main { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { background-color: #F59E0B; padding: 40px 20px; text-align: center; }
        .logo { font-weight: 800; font-size: 28px; color: #ffffff; text-decoration: none; }
        .content { padding: 40px 30px; color: #21262D; }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
        p { font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
        .stats-container { background-color: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #E5E7EB; }
        .stat-row { margin-bottom: 16px; }
        .stat-label { font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.025em; }
        .stat-value { font-size: 20px; font-weight: 700; color: #1F2937; }
        .stat-highlight { color: #F59E0B; }
        .button { background-color: #F59E0B; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; }
        .footer { text-align: center; padding: 24px; font-size: 14px; color: #9CA3AF; }
    </style>
</head>
<body>
    <div class="main">
        <div class="header"><div class="logo">PennyPal</div></div>
        <div class="content">
            <h1>90 Days of Progress, ${userProfile.preferred_name || 'Friend'}! 📈</h1>
            <p>We’ve officially crossed the first 90-day mark of 2026. In Q1, you took control of your financial future. Here is your recap:</p>
            <div class="stats-container">
                <div class="stat-row"><div class="stat-label">Total Tracked (Q1)</div><div class="stat-value">₵${totalTracked.toLocaleString()}</div></div>
                <div class="stat-row"><div class="stat-label">Smartest Move</div><div class="stat-value stat-highlight">${smartestMove}</div></div>
                <div class="stat-row"><div class="stat-label">Q1 Transactions</div><div class="stat-value">${totalTransactions}</div></div>
            </div>
            <p>Q1 was about building habits. Q2 is for growth. Let's make it count.</p>
            <div style="text-align: center;"><a href="https://mypennypal.com/manage" class="button">Set My Q2 Goals</a></div>
        </div>
        <div class="footer"><p>&copy; 2026 PennyPal • Your financial growth partner.</p></div>
    </div>
</body>
</html>`;
      }

      // 4. Send Email
      if (!isTestRun) {
        const { error: mailError } = await resend.emails.send({
          from: 'PennyPal <hello@mypennypal.com>',
          to: [userProfile.email || testEmail],
          subject,
          html: emailHtml,
        });

        if (mailError) {
          results.push({ email: userProfile.email || testEmail, status: 'error', error: mailError.message });
        } else {
          results.push({ email: userProfile.email || testEmail, status: 'sent', type: totalTransactions === 0 ? 'Inspiration' : 'Recap' });
        }
      } else {
        results.push({ email: userProfile.email || testEmail, status: 'skipped (test run)', type: totalTransactions === 0 ? 'Inspiration' : 'Recap' });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
