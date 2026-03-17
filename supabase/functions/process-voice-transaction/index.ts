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

    console.log(`Audio file received: size=${audioFile.size}, type=${audioFile.type}`);

    step = "transcription_fetch";
    const transcriptionFormData = new FormData();
    // Groq Whisper needs a filename with extension to recognize the format
    transcriptionFormData.append('file', audioFile, 'speech.webm');
    transcriptionFormData.append('model', 'whisper-large-v3');
    transcriptionFormData.append('response_format', 'json');

    console.log('Sending to Groq Whisper...');
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
    console.log('Transcript received:', transcript);

    if (!transcript || transcript.trim().length === 0) {
       throw new Error('No speech detected in audio.');
    }

    step = "extraction_fetch";
    console.log('Sending to Groq Llama for extraction...');
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
      throw new Error(`Llama Error (${extractionResponse.status}): ${errorText}`);
    }

    step = "extraction_parsing";
    const extractionResult = await extractionResponse.json();
    const resultText = extractionResult.choices[0].message.content;
    console.log('Extraction Result:', resultText);
    
    let structuredData;
    try {
        structuredData = JSON.parse(resultText);
    } catch (e) {
        throw new Error(`Failed to parse AI JSON: ${resultText}`);
    }

    step = "returning_response";
    return new Response(JSON.stringify(structuredData), {
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
