// @ts-nocheck - Deno runtime file: TS errors here are false positives (VS Code has no Deno extension)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://mypennypal.com',
  'https://www.mypennypal.com',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173'
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }
  const corsHeaders = getCorsHeaders(req);
  let step = "initialization";

  try {
    console.log('Voice processing started...');
    
    // 1. Auth & Usage Check
    step = "auth_check";
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header found.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('User authentication failed.');
    }

    step = "usage_check";
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('voice_credits, is_premium')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile not found: ${profileError.message}`);
    }

    if (!profile.is_premium && (profile.voice_credits === null || profile.voice_credits <= 0)) {
      return new Response(JSON.stringify({ 
        error: 'out_of_credits',
        message: 'You have run out of Voice Credits. Upgrade to Unlimited for 30 GHS/month!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    // 2. Groq Processing
    step = "getting_api_key";
    const rawApiKey = Deno.env.get('GROQ_API_KEY');
    if (!rawApiKey) {
      throw new Error('Supabase Secret GROQ_API_KEY is not defined.');
    }
    const groqApiKey = rawApiKey.trim();

    step = "parsing_form_data";
    const formData = await req.formData();
    const audioFile = formData.get('file');
    
    if (!audioFile) {
      throw new Error('No audio file provided.');
    }

    step = "transcription_fetch";
    const transcriptionFormData = new FormData();
    transcriptionFormData.append('file', audioFile, 'speech.webm');
    transcriptionFormData.append('model', 'whisper-large-v3');
    transcriptionFormData.append('response_format', 'json');

    const transcriptionResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: transcriptionFormData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(`Whisper Error (${transcriptionResponse.status}): ${errorText}`);
    }

    step = "transcription_parsing";
    const transcriptionData = await transcriptionResponse.json();
    const transcript = transcriptionData.text;

    if (!transcript || transcript.trim().length === 0) {
       throw new Error('No speech detected in audio.');
    }

    step = "extraction_fetch";
    const extractionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a financial assistant for "Penny Pal", an expense tracker. 
            Extract transaction details from the user's spoken text.
            
            Return ONLY a JSON object with these fields:
            - amount: number (numeric value only)
            - type: "income" or "expense"
            - category: Use one of these: "Salary", "Freelance", "Business", "Investment", "Gift", "Bonus", "Food & Dining 🍽️", "Transportation 🚗", "Shopping 🛒", "Entertainment 🎬", "Bills & Utilities ⚡", "Healthcare 🏥", "Education 📚", "Travel ✈️", "Groceries 🛍️", "Rent 🏠", "Gifting 🎁", "Other Income", "Other Expense"
            - note: string (brief description)
            - date: string (YYYY-MM-DD, defaults to today ${new Date().toISOString().split('T')[0]} if not mentioned)

            Return ONLY the valid JSON object. No other text.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0,
        response_format: { type: 'json_object' }
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      throw new Error(`Extraction Error (${extractionResponse.status}): ${errorText}`);
    }

    step = "extraction_parsing";
    const extractionResult = await extractionResponse.json();
    const resultText = extractionResult.choices[0].message.content;
    const structuredData = JSON.parse(resultText);

    // 3. Decrement Credits (if not premium)
    step = "update_usage";
    let remainingCredits = profile.voice_credits;
    if (!profile.is_premium) {
      remainingCredits = profile.voice_credits - 1;
      await supabaseClient
        .from('profiles')
        .update({ voice_credits: remainingCredits })
        .eq('user_id', user.id);
    }

    step = "returning_response";
    return new Response(JSON.stringify({
      ...structuredData,
      remaining_credits: profile.is_premium ? 'unlimited' : remainingCredits,
      is_premium: profile.is_premium
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error(`Error at step [${step}]:`, error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      step: step
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
