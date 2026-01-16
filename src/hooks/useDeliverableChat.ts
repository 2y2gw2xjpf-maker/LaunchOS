/**
 * LaunchOS Deliverable Chat Hook
 * Multi-Step Chat Flow für Deliverable-Generierung
 */

import * as React from 'react';
import { DELIVERABLE_CONFIGS } from '@/lib/services/deliverable-configs';
import {
  generatePitchDeck,
  generateBusinessPlan,
  generateInvestorList,
  generateFinancialModel,
  generateValuationReport,
  type PitchDeckData,
  type BusinessPlanData,
  type InvestorData,
  type FinancialModelData,
  type ValuationReportData,
} from '@/lib/services/document-generator';
import type { DeliverableType } from '@/types';

// ==================== TYPES ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface DeliverableState {
  type: DeliverableType | null;
  step: number;
  data: Record<string, string | string[] | number | number[]>;
  isComplete: boolean;
}

interface QuestionConfig {
  key: string;
  prompt: string;
  optional?: boolean;
}

// ==================== QUESTION FLOWS ====================

const QUESTION_FLOWS: Record<DeliverableType, QuestionConfig[]> = {
  pitch_deck: [
    { key: 'companyName', prompt: 'Wie heisst dein Startup?' },
    {
      key: 'tagline',
      prompt: 'Hast du einen Slogan oder Tagline? (optional, Enter zum Uberspringen)',
      optional: true,
    },
    { key: 'problem', prompt: 'Welches Problem lost du? Beschreibe es aus Kundensicht.' },
    { key: 'solution', prompt: 'Wie lost du das Problem? Was macht dein Produkt/Service?' },
    {
      key: 'tam',
      prompt: 'Wie gross ist der Gesamtmarkt (TAM)? z.B. "€50 Mrd. Gesundheitsmarkt Deutschland"',
    },
    { key: 'sam', prompt: 'Wie gross ist dein adressierbarer Markt (SAM)?' },
    { key: 'som', prompt: 'Wie gross ist dein realistisch erreichbarer Markt (SOM)?' },
    { key: 'businessModel', prompt: 'Wie verdienst du Geld? Beschreibe dein Geschaftsmodell.' },
    { key: 'traction', prompt: 'Was hast du schon erreicht? Kunden, Umsatz, User? (optional)', optional: true },
    { key: 'teamInfo', prompt: 'Wer ist im Team? Nenne Namen und Rollen.' },
    { key: 'competition', prompt: 'Wer sind deine Wettbewerber? Was machst du besser?' },
    { key: 'ask', prompt: 'Wie viel Funding suchst du und wofur?' },
  ],
  business_plan: [
    { key: 'companyName', prompt: 'Wie heisst dein Unternehmen?' },
    {
      key: 'executiveSummary',
      prompt: 'Beschreibe dein Unternehmen in 3-5 Satzen (Executive Summary).',
    },
    { key: 'team', prompt: 'Wer sind die Grunder? Hintergrund und Expertise?' },
    { key: 'productService', prompt: 'Was genau bietest du an? Produkt oder Dienstleistung?' },
    { key: 'marketAnalysis', prompt: 'Wie sieht der Markt aus? Grosse, Wachstum, Wettbewerb?' },
    { key: 'marketingStrategy', prompt: 'Wie gewinnst du Kunden? Marketing & Vertrieb?' },
    { key: 'operations', prompt: 'Wie ist die Organisation? Personal, Standort, Prozesse?' },
    {
      key: 'financialPlan',
      prompt: 'Wie sieht die Finanzplanung aus? Umsatz, Kosten, Break-Even?',
    },
    { key: 'risks', prompt: 'Welche Risiken gibt es? Wie gehst du damit um?' },
  ],
  investor_list: [
    { key: 'companyName', prompt: 'Wie heisst dein Startup?' },
    { key: 'industry', prompt: 'In welcher Branche/Sektor bist du?' },
    { key: 'stage', prompt: 'Welche Stage? (Pre-Seed, Seed, Series A)' },
    { key: 'ticketSize', prompt: 'Wie viel Funding suchst du?' },
    { key: 'geography', prompt: 'Welche Regionen? (nur DE, DACH, Europa, Global)' },
    { key: 'preferences', prompt: 'Besondere Praferenzen? (B2B/B2C, Impact, etc.)' },
  ],
  financial_model: [
    { key: 'companyName', prompt: 'Wie heisst dein Startup?' },
    { key: 'revenueModel', prompt: 'Wie verdienst du Geld? (SaaS, Einmalkauf, Provision, etc.)' },
    { key: 'pricing', prompt: 'Was kosten deine Produkte/Services?' },
    { key: 'cac', prompt: 'Was kostet es einen Kunden zu gewinnen (CAC)?' },
    { key: 'teamSize', prompt: 'Wie gross ist/wird das Team? Durchschnittsgehalt?' },
    { key: 'fixedCosts', prompt: 'Welche Fixkosten hast du monatlich?' },
  ],
  valuation_report: [
    { key: 'companyName', prompt: 'Wie heisst dein Startup?' },
    { key: 'stage', prompt: 'In welcher Stage bist du? (Idea, MVP, Revenue)' },
    { key: 'industry', prompt: 'Welche Branche?' },
    { key: 'traction', prompt: 'Was hast du schon erreicht? (Kunden, Umsatz, Growth)', optional: true },
    { key: 'teamExperience', prompt: 'Erfahrung des Grunderteams?' },
    { key: 'marketSize', prompt: 'Bekannte Marktgrosse?', optional: true },
  ],
  legal_docs: [
    { key: 'companyName', prompt: 'Wie heisst dein Unternehmen (inkl. Rechtsform)?' },
    { key: 'address', prompt: 'Geschäftsadresse?' },
    { key: 'contact', prompt: 'Kontaktdaten (Telefon, E-Mail)?' },
    { key: 'representative', prompt: 'Vertretungsberechtigte Person?' },
    { key: 'docTypes', prompt: 'Welche Dokumente brauchst du? (Impressum, Datenschutz, AGB)' },
  ],
  data_room: [
    { key: 'companyName', prompt: 'Wie heisst dein Startup?' },
    { key: 'stage', prompt: 'Funding Stage? (Seed, Series A, etc.)' },
    { key: 'companyType', prompt: 'Rechtsform? (GmbH, UG, AG)' },
    { key: 'teamSize', prompt: 'Anzahl Mitarbeiter?' },
    { key: 'hasIP', prompt: 'Hast du IP (Patente, Marken)?', optional: true },
  ],
  outreach_emails: [
    { key: 'companyName', prompt: 'Wie heisst dein Startup?' },
    { key: 'startupDescription', prompt: 'Kurze Beschreibung (2-3 Satze)' },
    { key: 'traction', prompt: 'Was hast du erreicht?' },
    { key: 'ask', prompt: 'Was brauchst du? (Funding, Intro, Advice)' },
    { key: 'emailType', prompt: 'Welche Art von Email? (Cold, Warm Intro, Follow-Up)' },
  ],
};

// ==================== HOOK ====================

export function useDeliverableChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [deliverable, setDeliverable] = React.useState<DeliverableState>({
    type: null,
    step: 0,
    data: {},
    isComplete: false,
  });
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Add message to chat
  const addMessage = React.useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Start a deliverable flow
  const startDeliverable = React.useCallback(
    (type: DeliverableType) => {
      const config = DELIVERABLE_CONFIGS[type];
      const questions = QUESTION_FLOWS[type];

      setDeliverable({
        type,
        step: 0,
        data: {},
        isComplete: false,
      });

      // Welcome message + first question
      addMessage(
        'assistant',
        `Ich helfe dir gerne bei deinem **${config.title}**!\n\n${config.description}\n\n${questions[0].prompt}`
      );
    },
    [addMessage]
  );

  // Process user input
  const processUserInput = React.useCallback(
    async (input: string) => {
      addMessage('user', input);

      // If no deliverable started, detect intent
      if (!deliverable.type) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('pitch deck') || lowerInput.includes('prasentation')) {
          startDeliverable('pitch_deck');
        } else if (lowerInput.includes('businessplan') || lowerInput.includes('business plan')) {
          startDeliverable('business_plan');
        } else if (
          lowerInput.includes('investor') &&
          (lowerInput.includes('liste') || lowerInput.includes('finden'))
        ) {
          startDeliverable('investor_list');
        } else if (lowerInput.includes('finanz') || lowerInput.includes('financial')) {
          startDeliverable('financial_model');
        } else if (lowerInput.includes('bewertung') || lowerInput.includes('valuation')) {
          startDeliverable('valuation_report');
        } else if (
          lowerInput.includes('impressum') ||
          lowerInput.includes('datenschutz') ||
          lowerInput.includes('agb')
        ) {
          startDeliverable('legal_docs');
        } else if (lowerInput.includes('data room') || lowerInput.includes('due diligence')) {
          startDeliverable('data_room');
        } else if (lowerInput.includes('email') || lowerInput.includes('outreach')) {
          startDeliverable('outreach_emails');
        } else {
          // Show menu
          addMessage(
            'assistant',
            `Ich kann dir bei folgenden Dingen helfen:

- **Pitch Deck erstellen** - 10-12 Slides fur Investoren
- **Businessplan schreiben** - Strukturierter Plan fur Banken & Fordermittel
- **Investor-Liste recherchieren** - Passende Angels & VCs finden
- **Finanzmodell bauen** - 3-Jahres-Projektion mit Szenarien
- **Bewertungsreport** - Detaillierte Startup-Bewertung
- **Rechtliche Texte** - Impressum, Datenschutz, AGB
- **Data Room** - Struktur fur Due Diligence
- **Outreach Emails** - Templates fur Investoren-Kontakt

Was mochtest du machen?`
          );
        }
        return;
      }

      // Process input for current deliverable
      const questions = QUESTION_FLOWS[deliverable.type];
      const currentQuestion = questions[deliverable.step];

      // Store answer (allow empty for optional fields)
      const trimmedInput = input.trim();
      const newData = { ...deliverable.data };

      if (trimmedInput || !currentQuestion.optional) {
        newData[currentQuestion.key] = trimmedInput;
      }

      // Check if we have more questions
      if (deliverable.step < questions.length - 1) {
        // Next question
        setDeliverable((prev) => ({
          ...prev,
          step: prev.step + 1,
          data: newData,
        }));
        addMessage('assistant', questions[deliverable.step + 1].prompt);
      } else {
        // All questions answered - ready to generate
        setDeliverable((prev) => ({
          ...prev,
          data: newData,
          isComplete: true,
        }));

        const config = DELIVERABLE_CONFIGS[deliverable.type];
        addMessage(
          'assistant',
          `Perfekt! Ich habe alle Infos fur dein **${config.title}**.\n\nKlicke auf "Jetzt generieren" um das Dokument zu erstellen.`
        );
      }
    },
    [deliverable, addMessage, startDeliverable]
  );

  // Generate the deliverable document
  const generateDeliverable = React.useCallback(async () => {
    if (!deliverable.type || !deliverable.isComplete) return;

    setIsGenerating(true);
    addMessage('assistant', 'Ich generiere dein Dokument...');

    try {
      const data = deliverable.data;

      switch (deliverable.type) {
        case 'pitch_deck': {
          // Parse team info into array
          const teamInfo = (data.teamInfo as string) || '';
          const teamMembers = teamInfo
            .split(/[,;]/)
            .map((t) => {
              const parts = t.trim().split(/[-:]/).map((p) => p.trim());
              return {
                name: parts[0] || 'Team Member',
                role: parts[1] || 'Co-Founder',
                bio: parts[2],
              };
            })
            .filter((t) => t.name);

          await generatePitchDeck({
            companyName: (data.companyName as string) || 'Mein Startup',
            tagline: data.tagline as string,
            problem: (data.problem as string) || '',
            solution: (data.solution as string) || '',
            market: {
              tam: data.tam as string,
              sam: data.sam as string,
              som: data.som as string,
            },
            businessModel: (data.businessModel as string) || '',
            traction: data.traction as string,
            team: teamMembers.length > 0 ? teamMembers : [{ name: 'Founder', role: 'CEO' }],
            competition: data.competition as string,
            ask: (data.ask as string) || '',
          });
          break;
        }

        case 'business_plan': {
          await generateBusinessPlan({
            companyName: (data.companyName as string) || 'Mein Startup',
            executiveSummary: (data.executiveSummary as string) || '',
            team: (data.team as string) || '',
            productService: (data.productService as string) || '',
            marketAnalysis: (data.marketAnalysis as string) || '',
            marketingStrategy: (data.marketingStrategy as string) || '',
            operations: (data.operations as string) || '',
            financialPlan: (data.financialPlan as string) || '',
            risks: (data.risks as string) || '',
          });
          break;
        }

        case 'investor_list': {
          // Generate sample investor list based on criteria
          const sampleInvestors: InvestorData[] = [
            {
              name: 'High-Tech Grunderfonds',
              type: 'VC',
              focusAreas: (data.industry as string) || 'Tech',
              ticketSize: '€500k - €3M',
              portfolio: 'Beispiele aus Portfolio',
              contact: 'htgf.de',
              fitScore: 5,
              notes: 'Offentlicher VC, guter Einstieg',
            },
            {
              name: 'Cherry Ventures',
              type: 'VC',
              focusAreas: 'B2B SaaS, Consumer',
              ticketSize: '€500k - €5M',
              portfolio: 'Flixbus, Auto1, Infarm',
              contact: 'cherry.vc',
              fitScore: 4,
              notes: 'Top Tier VC Berlin',
            },
            {
              name: 'Project A',
              type: 'VC',
              focusAreas: 'Digital, Marketplace',
              ticketSize: '€1M - €10M',
              portfolio: 'WorldRemit, Catawiki',
              contact: 'project-a.com',
              fitScore: 4,
              notes: 'Operational Support',
            },
          ];

          await generateInvestorList(sampleInvestors, (data.companyName as string) || 'Startup');
          break;
        }

        case 'financial_model': {
          // Generate sample financial model
          const baseRevenue = 5000;
          const monthlyGrowth = 1.15;
          const monthlyRevenue = Array.from(
            { length: 12 },
            (_, i) => Math.round(baseRevenue * Math.pow(monthlyGrowth, i))
          );
          const monthlyCosts = Array(12).fill(3000);
          const teamCosts = Array(12).fill(8000);

          await generateFinancialModel({
            companyName: (data.companyName as string) || 'Mein Startup',
            assumptions: [
              { label: 'Monatliches Wachstum', value: 15, unit: '%' },
              { label: 'Preis pro Kunde', value: parseFloat(data.pricing as string) || 99, unit: '€' },
              { label: 'CAC', value: parseFloat(data.cac as string) || 150, unit: '€' },
            ],
            monthlyRevenue,
            monthlyCosts,
            teamCosts,
          });
          break;
        }

        case 'valuation_report': {
          await generateValuationReport({
            companyName: (data.companyName as string) || 'Mein Startup',
            date: new Date().toLocaleDateString('de-DE'),
            methods: [
              {
                name: 'Berkus Method',
                value: 500000,
                confidence: 65,
                notes: ['Pre-Revenue Bewertung', 'Basierend auf Team und Idee'],
              },
              {
                name: 'Scorecard Method',
                value: 750000,
                confidence: 70,
                notes: ['Vergleich mit ahnlichen Startups'],
              },
            ],
            finalValuation: {
              low: 400000,
              mid: 625000,
              high: 850000,
            },
            assumptions: [
              'Pre-Revenue oder Early-Stage',
              'Markt noch nicht validiert',
              'Team-Bewertung basierend auf Erfahrung',
            ],
            disclaimer:
              'Diese Bewertung dient nur zur Orientierung und stellt kein Gutachten dar. Fur Investitionsentscheidungen sollte eine professionelle Bewertung eingeholt werden.',
          });
          break;
        }

        default:
          throw new Error(`Generator fur ${deliverable.type} noch nicht implementiert`);
      }

      const config = DELIVERABLE_CONFIGS[deliverable.type];
      addMessage(
        'assistant',
        `Dein **${config.title}** wurde erstellt und heruntergeladen!

Mochtest du:
- **Anderungen machen** - "Mach das kurzer" / "Ubersetze auf Englisch"
- **Neu starten** - "Neues Pitch Deck"
- **Etwas anderes** - "Hilf mir bei..."

Was kann ich noch fur dich tun?`
      );

      // Reset for next deliverable
      setDeliverable({ type: null, step: 0, data: {}, isComplete: false });
    } catch (error) {
      console.error('Generation error:', error);
      addMessage(
        'assistant',
        `Es gab einen Fehler bei der Generierung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}. Bitte versuche es nochmal.`
      );
    } finally {
      setIsGenerating(false);
    }
  }, [deliverable, addMessage]);

  // Reset chat
  const reset = React.useCallback(() => {
    setMessages([]);
    setDeliverable({ type: null, step: 0, data: {}, isComplete: false });
  }, []);

  return {
    messages,
    deliverable,
    isGenerating,
    processUserInput,
    generateDeliverable,
    startDeliverable,
    reset,
  };
}

export default useDeliverableChat;
