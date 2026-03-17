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

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Missing GROQ_API_KEY');
    }

    // Get the audio data from the multipart form
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1. Transcribe audio using Groq Whisper
    const transcriptionFormData = new FormData();
    transcriptionFormData.append('file', audioFile);
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
      console.error('Groq Transcription Error:', errorText);
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
    }

    const { text: transcript } = await transcriptionResponse.json();
    console.log('Transcript:', transcript);

    // 2. Extract structured data using Groq Llama 3
    const extractionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
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
      console.error('Groq Extraction Error:', errorText);
      throw new Error(`Extraction failed: ${extractionResponse.statusText}`);
    }

    const extractionResult = await extractionResponse.json();
    const resultText = extractionResult.choices[0].message.content;
    const structuredData = JSON.parse(resultText);

    return new Response(JSON.stringify(structuredData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error('Voice Processing Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
