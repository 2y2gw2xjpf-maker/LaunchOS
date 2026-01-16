// Supabase Edge Function: Audio Transcription with OpenAI Whisper
// Deploy with: supabase functions deploy transcribe
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, language = 'de' } = await req.json();

    if (!audio) {
      throw new Error('Audio data is required');
    }

    // Convert base64 to Uint8Array
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create File object for OpenAI
    const file = new File([bytes], 'audio.webm', { type: 'audio/webm' });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language,
      response_format: 'text',
    });

    return new Response(
      JSON.stringify({
        success: true,
        text: transcription,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  }
});
