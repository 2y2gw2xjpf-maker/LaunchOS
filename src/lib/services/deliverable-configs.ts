/**
 * LaunchOS Deliverable Configurations
 * Definiert alle Deliverable-Typen mit Gather- und Generate-Prompts
 */

import type { DeliverableType } from '@/types';

export interface DeliverableConfig {
  type: DeliverableType;
  title: string;
  description: string;
  outputFormat: 'pptx' | 'docx' | 'xlsx' | 'pdf' | 'md';
  icon: string;
  gatherPrompt: string;
  generatePrompt: string;
  requiredFields: string[];
  estimatedTime: string;
}

export const DELIVERABLE_CONFIGS: Record<DeliverableType, DeliverableConfig> = {
  pitch_deck: {
    type: 'pitch_deck',
    title: 'Pitch Deck',
    description: '10-15 Slides für Investoren im Sequoia-Stil',
    outputFormat: 'pptx',
    icon: 'Presentation',
    gatherPrompt: `Ich helfe dir ein Pitch Deck zu erstellen. Lass uns Slide für Slide durchgehen:

1. **Problem**: Welches Problem löst du? Wer hat dieses Problem?
2. **Lösung**: Wie löst du es? Was ist dein Produkt?
3. **Markt**: Wie groß ist der Markt (TAM/SAM/SOM)?
4. **Geschäftsmodell**: Wie verdienst du Geld?
5. **Traction**: Was hast du erreicht? (Kunden, Umsatz, Wachstum)
6. **Team**: Wer seid ihr? Relevante Erfahrung?
7. **Wettbewerb**: Wer sind die Alternativen?
8. **Finanzen**: Aktuelle Zahlen und Prognose?
9. **Ask**: Wie viel Funding brauchst du? Wofür?

Lass uns mit dem Problem starten. Beschreibe das Problem, das du löst.`,
    generatePrompt: `Erstelle ein Pitch Deck im Sequoia-Stil basierend auf:
{context}

Struktur (10-12 Slides):
1. Title Slide (Company Name, Tagline)
2. Problem (Pain point, who has it)
3. Solution (Your product)
4. Why Now (Market timing)
5. Market Size (TAM/SAM/SOM)
6. Business Model (How you make money)
7. Traction (Metrics, milestones)
8. Competition (Differentiators)
9. Team (Founders, key hires)
10. Financials (Key metrics, projections)
11. The Ask (Funding amount, use of funds)

Pro Slide:
- Klare Headline (max 8 Wörter)
- Max 3-5 Bullet Points
- Daten wo möglich visualisieren
- Speaker Notes mit Erklärungen`,
    requiredFields: ['problem', 'solution', 'market', 'team', 'ask'],
    estimatedTime: '15-30 Minuten',
  },

  business_plan: {
    type: 'business_plan',
    title: 'Businessplan',
    description: 'Vollständiger Businessplan im KfW-Format',
    outputFormat: 'docx',
    icon: 'FileText',
    gatherPrompt: `Ich helfe dir einen Businessplan zu erstellen.

Dieser ist wichtig für:
- Investoren & Banken
- Fördermittel (EXIST, KfW)
- Deine eigene strategische Klarheit

Lass uns die Kernelemente durchgehen:

1. Was ist deine Geschäftsidee in einem Satz?
2. Wer ist deine Zielgruppe?
3. Was macht dich einzigartig?

Starte mit deiner Geschäftsidee.`,
    generatePrompt: `Erstelle einen Businessplan im KfW-Format:
{context}

Struktur:
1. **Executive Summary** (1 Seite)
   - Geschäftsidee, Markt, Team, Finanzen

2. **Gründer & Team** (1-2 Seiten)
   - Qualifikationen, Erfahrungen, Motivation

3. **Produkt/Dienstleistung** (2-3 Seiten)
   - Beschreibung, USP, Entwicklungsstand

4. **Markt & Wettbewerb** (2-3 Seiten)
   - Marktgröße, Zielgruppe, Wettbewerbsanalyse

5. **Marketing & Vertrieb** (1-2 Seiten)
   - Strategie, Kanäle, Kundengewinnung

6. **Organisation & Standort** (1 Seite)
   - Rechtsform, Struktur, Standort

7. **Finanzplanung** (3-5 Seiten)
   - Kapitalbedarf, Umsatzprognose, Rentabilität

8. **Chancen & Risiken** (1 Seite)
   - SWOT, Risikominimierung

Professioneller Ton, konkrete Zahlen wo verfügbar.`,
    requiredFields: ['idea', 'team', 'market'],
    estimatedTime: '45-90 Minuten',
  },

  financial_model: {
    type: 'financial_model',
    title: 'Finanzmodell',
    description: '3-5 Jahre Finanzprojektion mit Szenarien',
    outputFormat: 'xlsx',
    icon: 'Calculator',
    gatherPrompt: `Für ein Finanzmodell brauche ich:

1. **Umsatzmodell**: SaaS (MRR), Einmalkauf, Provision, Abo?
2. **Preise**: Was kostet dein Produkt?
3. **Kundenakquise**: Wie gewinnst du Kunden? (CAC)
4. **Team**: Geplante Gehälter?
5. **Kosten**: Fixkosten? (Miete, Tools, etc.)

Wie sieht dein Umsatzmodell aus?`,
    generatePrompt: `Erstelle ein Excel-Finanzmodell:
{context}

Sheets:
1. **Assumptions** (editierbar)
   - Preise, Wachstumsraten, Conversion Rates
   - Alle Annahmen hier zentral

2. **Revenue Model** (3 Jahre monatlich)
   - Kunden/Nutzer Entwicklung
   - MRR/ARR bei SaaS
   - Churn Rate

3. **Cost Structure**
   - Fixkosten (Gehälter, Miete, Tools)
   - Variable Kosten (CAC, Hosting)
   - COGS

4. **P&L** (Profit & Loss)
   - Revenue, Gross Margin, EBITDA
   - Break-Even Punkt

5. **Cash Flow**
   - Runway Berechnung
   - Funding Needs

6. **Scenarios** (Base, Bull, Bear)
   - Unterschiedliche Wachstumsannahmen

Alle Formeln müssen funktionieren!`,
    requiredFields: ['revenue_model', 'pricing', 'costs'],
    estimatedTime: '30-60 Minuten',
  },

  investor_list: {
    type: 'investor_list',
    title: 'Investor Short-List',
    description: 'Passende Investoren für deine Branche und Stage',
    outputFormat: 'xlsx',
    icon: 'Users',
    gatherPrompt: `Für passende Investoren brauche ich:

1. **Branche**: In welchem Sektor bist du? (SaaS, FinTech, HealthTech, etc.)
2. **Stage**: Pre-Seed, Seed, Series A?
3. **Ticket Size**: Wie viel Funding suchst du?
4. **Geografie**: DE, DACH, Europa, Global?
5. **Präferenzen**: B2B/B2C? Nur VCs oder auch Angels?

In welcher Branche bist du?`,
    generatePrompt: `Recherchiere Investoren basierend auf:
{context}

Pro Investor liefere:
- **Name & Firma**
- **Typ** (VC, Angel, Family Office, Corporate VC)
- **Investment-Größe** (Ticket Range)
- **Fokus-Branchen**
- **Fokus-Stages**
- **Portfolio-Beispiele** (3-5 relevante)
- **Kontaktweg** (Warm Intro nötig?, Website, LinkedIn)
- **Fit-Score** (1-5 Sterne)
- **Notizen** (Besonderheiten, Tipps)

Sortiert nach Fit-Score (beste zuerst).
Mindestens 20 Investoren.
Nur aktive Investoren mit deutschen/europäischen Deals.`,
    requiredFields: ['industry', 'stage', 'ticket_size'],
    estimatedTime: '20-40 Minuten',
  },

  valuation_report: {
    type: 'valuation_report',
    title: 'Bewertungsreport',
    description: 'Detaillierte Bewertung mit Methodik-Erklärung',
    outputFormat: 'pdf',
    icon: 'TrendingUp',
    gatherPrompt: `Für eine Bewertung brauche ich:

1. **Stage**: Idea, MVP, Revenue?
2. **Branche**: Welcher Sektor?
3. **Traction**: Kunden, Umsatz, Wachstum?
4. **Team**: Erfahrung der Gründer?
5. **Markt**: Marktgröße bekannt?

In welcher Stage bist du?`,
    generatePrompt: `Erstelle einen Bewertungsreport:
{context}

Struktur:
1. **Executive Summary**
   - Bewertungsrange (Low/Mid/High)
   - Confidence Score
   - Key Drivers

2. **Methodik**
   - Verwendete Methoden (Berkus, Scorecard, VC Method, etc.)
   - Warum diese Methoden

3. **Detaillierte Berechnung**
   - Pro Methode: Inputs, Berechnung, Ergebnis
   - Gewichtung der Methoden

4. **Verbesserungsvorschläge**
   - Was würde die Bewertung erhöhen?
   - Konkrete nächste Schritte

5. **Disclaimer**
   - Orientierungswert, kein Gutachten
   - Empfehlung für professionelle Bewertung

⚠️ WICHTIG: Disclaimer IMMER einbauen!`,
    requiredFields: ['stage', 'industry'],
    estimatedTime: '10-20 Minuten',
  },

  legal_docs: {
    type: 'legal_docs',
    title: 'Rechtliche Texte',
    description: 'Impressum, Datenschutz, AGB',
    outputFormat: 'docx',
    icon: 'Scale',
    gatherPrompt: `Welche rechtlichen Texte brauchst du?

1. **Impressum** - Pflicht für jede Website
2. **Datenschutzerklärung** - DSGVO-Pflicht
3. **AGB** - Optional, aber empfohlen

Was brauchst du? Ich brauche dann:
- Firmenname und Rechtsform
- Adresse
- Vertretungsberechtigte Person
- Kontaktdaten`,
    generatePrompt: `Erstelle rechtliche Texte:
{context}

⚠️ DISCLAIMER AM ANFANG:
"Diese Texte sind Muster und ersetzen keine Rechtsberatung.
Lass sie von einem Anwalt prüfen bevor du sie verwendest."

Dann die gewünschten Texte gemäß deutschem Recht:
- TMG §5 für Impressum
- DSGVO Art. 13/14 für Datenschutz
- BGB für AGB

Professioneller, rechtlich korrekter Ton.`,
    requiredFields: ['company_name', 'address', 'contact'],
    estimatedTime: '10-20 Minuten',
  },

  data_room: {
    type: 'data_room',
    title: 'Data Room Struktur',
    description: 'Ordnerstruktur und Checkliste für Due Diligence',
    outputFormat: 'md',
    icon: 'FolderOpen',
    gatherPrompt: `Für deinen Data Room brauche ich:

1. **Stage**: Seed, Series A, etc.?
2. **Rechtsform**: GmbH, UG, etc.?
3. **Mitarbeiter**: Wie viele?
4. **IP**: Patente, Marken?

In welcher Stage bereitest du den Data Room vor?`,
    generatePrompt: `Erstelle eine Data Room Struktur:
{context}

Ordnerstruktur:
📁 1. Corporate
   - Gesellschaftsvertrag
   - Handelsregisterauszug
   - Gesellschafterliste
   - Geschäftsführervertrag

📁 2. Financial
   - Jahresabschlüsse (letzte 3 Jahre)
   - BWA (letzte 12 Monate)
   - Finanzmodell
   - Cap Table

📁 3. Legal
   - Kundenverträge (Templates)
   - AGB
   - Datenschutz
   - IP-Rechte (Patente, Marken)

📁 4. Team
   - Org Chart
   - Arbeitsverträge (anonymisiert)
   - ESOP/VSOP Details

📁 5. Product
   - Product Roadmap
   - Technical Architecture
   - Security & Compliance

📁 6. Traction
   - Key Metrics Dashboard
   - Kundenreferenzen
   - Case Studies

Pro Dokument: Was es ist, warum wichtig, Priorität (Must/Should/Nice).`,
    requiredFields: ['stage', 'company_type'],
    estimatedTime: '15-30 Minuten',
  },

  outreach_emails: {
    type: 'outreach_emails',
    title: 'Outreach Emails',
    description: 'Email-Templates für Investoren-Kontakt',
    outputFormat: 'docx',
    icon: 'Mail',
    gatherPrompt: `Für Investor-Emails brauche ich:

1. **Startup**: Kurze Beschreibung (2-3 Sätze)
2. **Traction**: Was hast du erreicht?
3. **Ask**: Funding, Intro, Advice?
4. **Typ**: Cold Email oder Warm Intro?

Beschreib kurz dein Startup.`,
    generatePrompt: `Erstelle Email-Templates:
{context}

Varianten:

**1. Cold Email (max 5 Sätze)**
- Subject Line (curiosity, not clickbait)
- Kurze Intro (wer du bist)
- Traction (1 Satz, beeindruckend)
- Why them (warum dieser Investor)
- Clear Ask

**2. Warm Intro Request**
- An den Connector
- Kurz und einfach zu forwarden

**3. Follow-Up (nach 1 Woche)**
- Kurz, nicht pushy
- Neuer Datenpunkt wenn möglich

**4. Meeting Request**
- Wenn Interesse da ist
- Klare nächste Schritte

YC-Stil: Kurz, klar, keine Floskeln.
Max 100 Wörter pro Email.`,
    requiredFields: ['startup_description', 'traction', 'ask'],
    estimatedTime: '10-20 Minuten',
  },
};

/**
 * Holt die Config für einen Deliverable-Typ
 */
export function getDeliverableConfig(type: DeliverableType): DeliverableConfig {
  return DELIVERABLE_CONFIGS[type];
}

/**
 * Alle Deliverable-Typen als Array
 */
export function getAllDeliverableTypes(): DeliverableType[] {
  return Object.keys(DELIVERABLE_CONFIGS) as DeliverableType[];
}

export default DELIVERABLE_CONFIGS;
