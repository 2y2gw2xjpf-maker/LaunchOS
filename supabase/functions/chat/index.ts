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

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'generate_pitch_deck',
    description: 'Generiert ein Pitch Deck als PPTX Datei. Nutze dieses Tool wenn der User ein Pitch Deck, eine Präsentation für Investoren, oder Sales Deck erstellen möchte.',
    input_schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Name des Unternehmens' },
        tagline: { type: 'string', description: 'Slogan oder Kurzbeschreibung' },
        problem: { type: 'string', description: 'Das Problem das gelöst wird' },
        solution: { type: 'string', description: 'Die Lösung' },
        market_size: { type: 'string', description: 'Marktgröße (TAM/SAM/SOM)' },
        business_model: { type: 'string', description: 'Wie wird Geld verdient' },
        traction: { type: 'string', description: 'Bisherige Erfolge, Metriken' },
        team: { type: 'string', description: 'Team Beschreibung' },
        ask: { type: 'string', description: 'Funding Ask und Use of Funds' },
        branding: {
          type: 'object',
          properties: {
            primary_color: { type: 'string', description: 'Primärfarbe als Hex (z.B. #9333ea)' },
            secondary_color: { type: 'string', description: 'Sekundärfarbe als Hex' },
            logo_url: { type: 'string', description: 'URL zum Logo' },
            font: { type: 'string', description: 'Font Name' },
          }
        }
      },
      required: ['company_name', 'problem', 'solution'],
    },
  },
  {
    name: 'generate_business_plan',
    description: 'Generiert einen Businessplan als DOCX Datei.',
    input_schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        sections: {
          type: 'object',
          properties: {
            executive_summary: { type: 'string' },
            product: { type: 'string' },
            market: { type: 'string' },
            team: { type: 'string' },
            financials: { type: 'string' },
          }
        }
      },
      required: ['company_name'],
    },
  },
  {
    name: 'search_investors',
    description: 'Sucht nach passenden Investoren basierend auf Kriterien. Nutze dieses Tool wenn der User nach VCs, Angels, oder Investoren fragt.',
    input_schema: {
      type: 'object',
      properties: {
        industry: { type: 'string', description: 'Branche (z.B. HealthTech, FinTech)' },
        stage: { type: 'string', description: 'Stage (Pre-Seed, Seed, Series A)' },
        ticket_size: { type: 'string', description: 'Gewünschte Investitionssumme' },
        geography: { type: 'string', description: 'Region (DACH, Europa, Global)' },
      },
      required: ['industry'],
    },
  },
  {
    name: 'fetch_url',
    description: 'Lädt den Inhalt einer URL und gibt den Text zurück. Nutze dies wenn der User eine URL teilt oder du Informationen von einer Webseite brauchst.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Die URL die geladen werden soll' },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_journey_step',
    description: 'Holt Details zu einem spezifischen Schritt aus der Founder Journey. Nutze dies wenn der User nach Hilfe bei einem bestimmten Gründungsschritt fragt.',
    input_schema: {
      type: 'object',
      properties: {
        step_id: { type: 'string', description: 'ID des Journey Steps' },
        step_title: { type: 'string', description: 'Oder Titel des Steps (z.B. "GmbH gründen")' },
      },
    },
  },
  {
    name: 'calculate_valuation',
    description: 'Berechnet eine Startup-Bewertung basierend auf verschiedenen Methoden.',
    input_schema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['berkus', 'scorecard', 'vc_method', 'revenue_multiple'],
          description: 'Bewertungsmethode'
        },
        inputs: {
          type: 'object',
          description: 'Inputs für die Bewertung (abhängig von Methode)'
        }
      },
      required: ['method'],
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// TOOL HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  switch (toolName) {
    case 'generate_pitch_deck': {
      const fileId = crypto.randomUUID();
      const companyName = toolInput.company_name as string;
      const fileName = `${companyName.replace(/\s+/g, '_')}_Pitch_Deck.pptx`;

      await supabase.from('pending_generations').insert({
        id: fileId,
        type: 'pitch_deck',
        data: toolInput,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      return JSON.stringify({
        success: true,
        message: `Pitch Deck wird generiert. Du kannst es in wenigen Sekunden herunterladen.`,
        file_id: fileId,
        file_name: fileName,
        download_ready: true,
      });
    }

    case 'generate_business_plan': {
      const fileId = crypto.randomUUID();
      const companyName = toolInput.company_name as string;
      const fileName = `${companyName.replace(/\s+/g, '_')}_Businessplan.docx`;

      await supabase.from('pending_generations').insert({
        id: fileId,
        type: 'business_plan',
        data: toolInput,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      return JSON.stringify({
        success: true,
        message: `Businessplan wird generiert.`,
        file_id: fileId,
        file_name: fileName,
        download_ready: true,
      });
    }

    case 'search_investors': {
      const { data: investors } = await supabase
        .from('investors')
        .select('*')
        .ilike('focus_areas', `%${toolInput.industry}%`)
        .limit(10);

      if (investors && investors.length > 0) {
        return JSON.stringify({
          success: true,
          investors: investors.map((inv: Record<string, unknown>) => ({
            name: inv.name,
            type: inv.type,
            focus: inv.focus_areas,
            ticket: inv.ticket_size,
            website: inv.website,
            portfolio: inv.portfolio_companies,
          })),
        });
      }

      // Fallback: Return known DACH investors
      const knownInvestors = [
        { name: 'High-Tech Gründerfonds', type: 'VC', focus: 'Tech generell', ticket: '€500k-3M', website: 'https://www.htgf.de' },
        { name: 'Cherry Ventures', type: 'VC', focus: 'B2B SaaS, FinTech', ticket: '€500k-5M', website: 'https://cherry.vc' },
        { name: 'Point Nine', type: 'VC', focus: 'B2B SaaS', ticket: '€500k-5M', website: 'https://www.pointnine.com' },
        { name: 'Project A', type: 'VC', focus: 'Digital, E-Commerce', ticket: '€1-10M', website: 'https://project-a.com' },
        { name: 'Earlybird', type: 'VC', focus: 'Tech generell', ticket: '€1-15M', website: 'https://earlybird.com' },
      ];

      return JSON.stringify({
        success: true,
        message: `Hier sind einige relevante Investoren für ${toolInput.industry}:`,
        investors: knownInvestors,
        note: 'Für aktuelle Daten empfehle ich Crunchbase, PitchBook oder BAND.',
      });
    }

    case 'fetch_url': {
      try {
        const response = await fetch(toolInput.url as string, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchOS/1.0)' }
        });
        const html = await response.text();

        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 5000);

        return JSON.stringify({
          success: true,
          url: toolInput.url,
          content: textContent,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: `Konnte URL nicht laden: ${(error as Error).message}`,
        });
      }
    }

    case 'get_journey_step': {
      const { data: steps } = await supabase
        .from('journey_steps')
        .select(`*, resources:journey_resources(*)`)
        .or(toolInput.step_id ? `id.eq.${toolInput.step_id}` : `title.ilike.%${toolInput.step_title}%`)
        .limit(1);

      if (steps && steps.length > 0) {
        const step = steps[0] as Record<string, unknown>;
        const resources = step.resources as Array<Record<string, unknown>> | undefined;
        return JSON.stringify({
          success: true,
          step: {
            title: step.title,
            description: step.description,
            phase: step.phase,
            estimated_time: step.estimated_time,
            estimated_cost: step.estimated_cost,
            resources: resources?.map((r) => ({
              title: r.title,
              url: r.url,
              type: r.type,
            })),
          },
        });
      }

      return JSON.stringify({
        success: false,
        message: 'Step nicht gefunden',
      });
    }

    case 'calculate_valuation': {
      const method = toolInput.method as string;
      const inputs = toolInput.inputs as Record<string, unknown> || {};

      let valuation = { min: 0, max: 0, method: '' };

      switch (method) {
        case 'berkus':
          valuation = { min: 500000, max: 2500000, method: 'Berkus Method' };
          break;
        case 'scorecard':
          valuation = { min: 1000000, max: 3000000, method: 'Scorecard Method' };
          break;
        case 'vc_method':
          valuation = { min: 2000000, max: 5000000, method: 'VC Method' };
          break;
        case 'revenue_multiple':
          const revenue = (inputs.monthly_revenue as number || 10000) * 12;
          const multiple = inputs.multiple as number || 5;
          valuation = { min: revenue * (multiple - 1), max: revenue * (multiple + 1), method: 'Revenue Multiple' };
          break;
      }

      return JSON.stringify({
        success: true,
        valuation,
        disclaimer: '📊 Hinweis: Diese Bewertung ist eine Orientierung, kein Gutachten. Die tatsächliche Bewertung kann erheblich abweichen.',
      });
    }

    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}

// ═══════════════════════════════════════════════════════════════
// TOOLKIT CONTEXT - Builder's Toolkit Wissen
// ═══════════════════════════════════════════════════════════════

const TOOLKIT_CONTEXT = `
## Builder's Toolkit Wissen

Du hast Zugriff auf das LaunchOS Builder's Toolkit - eine Sammlung von Ressourcen für Gründer die mit AI-Coding-Tools arbeiten. Nutze dieses Wissen um Usern konkrete, hilfreiche Empfehlungen zu geben.

### AI-Coding-Tools die wir abdecken:

| Tool | Stärke | Schwäche | Ideal für |
|------|--------|----------|-----------|
| **Lovable** | Schnelle UI-Generierung | Kein echtes Backend | Landing Pages, Prototypen |
| **Bolt.new** | Full-Stack im Browser | Weniger Kontrolle | Schnelle MVPs |
| **Cursor** | Maximale Kontrolle, AI-Editor | Lernkurve | Erfahrene Entwickler |
| **Claude Code** | Autonome komplexe Aufgaben | Terminal-basiert | Profis, große Refactorings |
| **v0.dev** | UI-Komponenten generieren | Nur Komponenten | Copy-Paste in eigenes Projekt |
| **Replit** | Browser-IDE mit Hosting | Performance-Limits | Lernen, Experimentieren |

### Toolkit-Ressourcen - Verweise aktiv darauf!

Wenn relevant, verweise auf diese Pfade:

**Guides:**
- /toolkit/guides/was-braucht-ein-echtes-produkt - Basics für Anfänger
- /toolkit/guides/supabase-setup-guide - Datenbank von 0 aufsetzen
- /toolkit/guides/cursor-workflow-guide - Produktiv mit Cursor arbeiten
- /toolkit/guides/vercel-deployment-guide - Von localhost zu Production
- /toolkit/guides/api-keys-secrets-guide - Secrets sicher verwalten
- /toolkit/guides/claude-code-workflow-guide - Terminal-Agent für Profis

**Checklists:**
- /toolkit/checklists/mvp-readiness - 23 Punkte vor dem Launch prüfen
- /toolkit/checklists/go-live - 20 Punkte für den Go-Live Tag

**Prompts:**
- /toolkit/prompts - Copy-Paste Vorlagen für AI-Coding-Tools

**Tool-Vergleiche:**
- /toolkit/tools - Alle Tools im Vergleich
- /toolkit/tools/compare - Side-by-Side Vergleich

**Pitfalls:**
- /toolkit/pitfalls - Häufige Fehler vermeiden

### Kritische Pitfalls - PROAKTIV WARNEN!

Warne User vor diesen häufigen Fehlern wenn relevant:

1. **API-Keys im Frontend**
   - Problem: Keys sind im Browser sichtbar, können gestohlen werden
   - Lösung: Edge Functions / Server-Side Code nutzen
   - Guide: /toolkit/guides/api-keys-secrets-guide

2. **Keine echte Datenbank**
   - Problem: Lovable/Bolt generieren oft nur localStorage
   - Test: Bleiben Daten nach Browser-Refresh?
   - Lösung: Supabase integrieren
   - Guide: /toolkit/guides/supabase-setup-guide

3. **RLS nicht aktiviert bei Supabase**
   - Problem: JEDER kann ALLE Daten sehen ohne RLS!
   - Lösung: Row Level Security auf allen Tabellen aktivieren
   - Checklist: /toolkit/checklists/mvp-readiness

4. **Selbstgebaute Auth**
   - Problem: Sicherheitslücken, Session-Management komplex
   - Lösung: Supabase Auth, Clerk, oder Auth0 nutzen

5. **Kein Error Handling**
   - Problem: App crasht bei API-Fehlern
   - Lösung: try-catch, Error Boundaries, User-Feedback

### Antwort-Stil bei Build-Fragen:

1. **Beantworte die Frage konkret** - Keine ausweichenden Antworten
2. **Verweise auf Toolkit-Ressourcen** - Mit vollständigem Pfad!
3. **Warne vor relevanten Pitfalls** - Proaktiv, nicht erst wenn es zu spät ist
4. **Gib einen klaren nächsten Schritt** - Actionable Advice
`;

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════

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

### 2. Dokumente erstellen (Deliverables)
- Pitch Decks (PPTX) - nutze generate_pitch_deck Tool
- Businesspläne (DOCX) - nutze generate_business_plan Tool
- Investor-Listen - nutze search_investors Tool

### 3. Recherche
- Investoren finden - nutze search_investors Tool
- URLs analysieren - nutze fetch_url Tool
- Journey Steps erklären - nutze get_journey_step Tool

### 4. Bewertungen berechnen
- nutze calculate_valuation Tool

## WICHTIGE REGELN

### Bei Deliverables:
Wenn der User ein Dokument möchte, frage erst nach den wichtigsten Informationen:
- Firmenname
- Problem & Lösung
- Zielgruppe

Dann nutze das entsprechende Tool.

### Bei Bewertungen IMMER:
"📊 Hinweis: Diese Bewertung ist eine Orientierung, kein Gutachten."

### Bei rechtlichen Fragen:
"⚖️ Hinweis: Dies ist keine Rechtsberatung."

### Bei Finanzprognosen:
"📈 Hinweis: Prognosen basieren auf deinen Angaben."

## Ton
- Deutsch (Du-Form)
- Klar und direkt
- Ermutigend aber realistisch
- Konkrete nächste Schritte

${TOOLKIT_CONTEXT}
`;

function buildSystemPromptWithContext(
  userContext?: {
    userName?: string;
    companyName?: string;
    industry?: string;
    stage?: string;
    fundingPath?: string;
  },
  journeyContext?: {
    currentStep?: string;
    pendingTasks?: string[];
  },
  documentContext?: string
): string {
  let prompt = LAUNCHOS_SYSTEM_PROMPT;

  if (userContext && Object.keys(userContext).length > 0) {
    prompt += `\n\n## User-Kontext
Name: ${userContext.userName || 'Nicht angegeben'}
Firma: ${userContext.companyName || 'Noch nicht benannt'}
Branche: ${userContext.industry || 'Nicht angegeben'}
Stage: ${userContext.stage || 'idea'}
Funding Path: ${userContext.fundingPath || 'undecided'}`;
  }

  if (journeyContext?.currentStep) {
    prompt += `\n\n## Aktueller Kontext
Der User arbeitet gerade an: "${journeyContext.currentStep}"
${journeyContext.pendingTasks?.length ? `Offene Aufgaben: ${journeyContext.pendingTasks.join(', ')}` : ''}
Hilf ihm proaktiv bei diesen Aufgaben.`;
  }

  if (documentContext) {
    prompt += `\n\n## Hochgeladenes Dokument\n${documentContext}`;
  }

  return prompt;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION - Verify user JWT token
    // ═══════════════════════════════════════════════════════════════
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT for RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      messages,
      userContext,
      sessionId,
      attachments,
      journeyContext,
    } = await req.json();

    // Use authenticated user ID instead of trusting client-provided userId
    const userId = user.id;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Process attachments
    let documentContext = '';
    const processedMessages = [...messages];

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type === 'image') {
          // Add image to last user message for Claude Vision
          const lastUserMsgIndex = processedMessages.findLastIndex(
            (m: { role: string }) => m.role === 'user'
          );
          if (lastUserMsgIndex >= 0) {
            const content = processedMessages[lastUserMsgIndex].content;
            processedMessages[lastUserMsgIndex].content = [
              { type: 'text', text: typeof content === 'string' ? content : content[0]?.text || '' },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: attachment.mimeType,
                  data: attachment.base64,
                }
              }
            ];
          }
        } else if (attachment.type === 'document' && attachment.extractedText) {
          documentContext += `\n\n### ${attachment.name}:\n${attachment.extractedText.slice(0, 10000)}`;
        }
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPromptWithContext(
      userContext,
      journeyContext,
      documentContext || undefined
    );

    // Prepare messages for Claude API
    const claudeMessages = processedMessages.map((m: { role: string; content: string | unknown[] }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process with tool calling loop
    (async () => {
      try {
        let continueLoop = true;
        let currentMessages = claudeMessages;
        let fullResponse = '';

        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages: currentMessages,
            tools: TOOLS,
            stream: true,
          });

          type ToolUseBlock = { id: string; name: string; input: string | Record<string, unknown> };
          let toolUseBlocks: ToolUseBlock[] = [];
          let currentToolUse: { id: string; name: string; input: string } | null = null;

          for await (const event of response) {
            if (event.type === 'content_block_start') {
              const contentBlock = event.content_block as { type: string; id?: string; name?: string };
              if (contentBlock.type === 'tool_use') {
                currentToolUse = {
                  id: contentBlock.id!,
                  name: contentBlock.name!,
                  input: '',
                };
              }
            } else if (event.type === 'content_block_delta') {
              const delta = event.delta as { type: string; text?: string; partial_json?: string };
              if (delta.type === 'text_delta' && delta.text) {
                fullResponse += delta.text;
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text', text: delta.text })}\n\n`)
                );
              } else if (delta.type === 'input_json_delta' && currentToolUse && delta.partial_json) {
                currentToolUse.input += delta.partial_json;
              }
            } else if (event.type === 'content_block_stop') {
              if (currentToolUse) {
                try {
                  currentToolUse.input = JSON.parse(currentToolUse.input as string);
                } catch {
                  currentToolUse.input = {};
                }
                toolUseBlocks.push(currentToolUse as ToolUseBlock);
                currentToolUse = null;
              }
            } else if (event.type === 'message_stop') {
              if (toolUseBlocks.length > 0) {
                // Notify frontend about tool execution
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_start',
                    tools: toolUseBlocks.map(t => t.name)
                  })}\n\n`)
                );

                // Execute tools
                const toolResults = [];
                for (const tool of toolUseBlocks) {
                  const result = await handleToolCall(
                    tool.name,
                    tool.input as Record<string, unknown>,
                    supabase
                  );
                  toolResults.push({
                    type: 'tool_result',
                    tool_use_id: tool.id,
                    content: result,
                  });

                  // Send tool result to frontend
                  await writer.write(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'tool_result',
                      tool: tool.name,
                      result: JSON.parse(result),
                    })}\n\n`)
                  );
                }

                // Continue conversation with tool results
                currentMessages = [
                  ...currentMessages,
                  {
                    role: 'assistant',
                    content: [
                      ...(fullResponse ? [{ type: 'text', text: fullResponse }] : []),
                      ...toolUseBlocks.map(t => ({
                        type: 'tool_use',
                        id: t.id,
                        name: t.name,
                        input: t.input,
                      }))
                    ]
                  },
                  { role: 'user', content: toolResults },
                ];

                // Reset for next iteration
                fullResponse = '';
                toolUseBlocks = [];
              } else {
                continueLoop = false;
              }
            }
          }

          if (toolUseBlocks.length === 0) {
            continueLoop = false;
          }
        }

        // Save assistant message to database
        if (sessionId && userId && fullResponse) {
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
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: (error as Error).message })}\n\n`)
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
