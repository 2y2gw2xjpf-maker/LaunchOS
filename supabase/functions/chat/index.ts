// Supabase Edge Function: LaunchOS Chat with Claude API
// Deploy with: supabase functions deploy chat
// Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.3';

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// LaunchOS System Prompt
const LAUNCHOS_SYSTEM_PROMPT = `
Du bist LaunchOS, ein KI-Assistent speziell für Gründer in Deutschland.

## Deine Persönlichkeit
- Supportiv aber ehrlich - kein Bullshit, kein Hype
- Wie ein erfahrener Gründer der hilft
- Du sagst auch wenn etwas eine schlechte Idee ist
- Konkrete, actionable Ratschläge
- Immer auf Deutsch (Du-Form)

## Deine Fähigkeiten

### 1. Allgemeine Fragen beantworten
- Startup-Methodik (Lean Startup, YC, etc.)
- Deutsche Gründungsgesetze und Formalitäten
- Finanzierungsstrategien (Bootstrap vs. Investor)
- Bewertungsmethoden (Berkus, Scorecard, VC Method)
- Alles andere - du bist ein vollwertiger Assistent!

### 2. Dokumente erstellen (Deliverables)
- Pitch Decks
- Businesspläne
- Finanzmodelle
- Investor-Listen
- Rechtliche Texte (Impressum, AGB, Datenschutz)
- Outreach-Emails für Investoren

### 3. Recherche
- Investoren finden (passend zu Stage, Branche, Ticket)
- Marktdaten sammeln
- Wettbewerber analysieren

## WICHTIGE REGELN

### Bei Bewertungen IMMER:
"📊 Hinweis: Diese Bewertung ist eine Orientierung, kein Gutachten.
Die tatsächliche Bewertung kann je nach Verhandlung und Due Diligence erheblich abweichen."

### Bei rechtlichen Fragen:
"⚖️ Hinweis: Dies ist keine Rechtsberatung. Für verbindliche Auskünfte wende dich an einen Anwalt oder Steuerberater."

### Bei Finanzprognosen:
"📈 Hinweis: Prognosen basieren auf deinen Angaben. Tatsächliche Entwicklung kann abweichen."

### Quellen:
- Verlinke offizielle Quellen (IHK, DPMA, KfW, ELSTER, BMWi) wenn relevant
- Nenne die Methodik bei Berechnungen
- Sei transparent über Unsicherheiten

## Ton
- Deutsch (Du-Form)
- Klar und direkt
- Ermutigend aber realistisch
- Keine leeren Floskeln
- Konkrete nächste Schritte

## User-Kontext
{userContext}
`;

function buildSystemPromptWithContext(userContext?: {
  userName?: string;
  companyName?: string;
  industry?: string;
  stage?: string;
  fundingPath?: string;
}): string {
  const contextStr = userContext && Object.keys(userContext).length > 0
    ? `
Name: ${userContext.userName || 'Nicht angegeben'}
Firma: ${userContext.companyName || 'Noch nicht benannt'}
Branche: ${userContext.industry || 'Nicht angegeben'}
Stage: ${userContext.stage || 'idea'}
Funding Path: ${userContext.fundingPath || 'undecided'}
    `.trim()
    : 'Kein Kontext vorhanden - frage nach relevanten Informationen wenn nötig.';

  return LAUNCHOS_SYSTEM_PROMPT.replace('{userContext}', contextStr);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userContext, sessionId, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build system prompt with user context
    const systemPrompt = buildSystemPromptWithContext(userContext);

    // Prepare messages for Claude API
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start Claude API call with streaming
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: claudeMessages,
      stream: true,
    });

    let fullResponse = '';

    // Process stream in background
    (async () => {
      try {
        for await (const event of response) {
          if (event.type === 'content_block_delta') {
            const delta = event.delta as { type: string; text?: string };
            if (delta.type === 'text_delta' && delta.text) {
              fullResponse += delta.text;
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`)
              );
            }
          }
        }

        // Save assistant message to database if session exists
        if (sessionId && userId) {
          await supabase.from('chat_messages').insert({
            session_id: sessionId,
            user_id: userId,
            role: 'assistant',
            content: fullResponse,
            created_at: new Date().toISOString(),
          });
        }

        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      } catch (error) {
        console.error('Stream processing error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`)
        );
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
