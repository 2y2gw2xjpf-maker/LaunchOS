/**
 * LaunchOS Document Generator Service
 * Generiert PPTX, DOCX und XLSX Dokumente für Startups
 */

import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } from 'docx';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PitchDeckData {
  companyName: string;
  tagline?: string;
  problem: string;
  solution: string;
  market: {
    tam?: string;
    sam?: string;
    som?: string;
  };
  businessModel: string;
  traction?: string;
  team: { name: string; role: string; bio?: string }[];
  competition?: string;
  financials?: string;
  ask: string;
  useOfFunds?: string;
}

export interface BusinessPlanData {
  companyName: string;
  executiveSummary: string;
  team: string;
  productService: string;
  marketAnalysis: string;
  marketingStrategy: string;
  operations: string;
  financialPlan: string;
  risks: string;
}

export interface InvestorData {
  name: string;
  type: string;
  focusAreas: string;
  ticketSize: string;
  portfolio: string;
  contact: string;
  fitScore: number;
  notes: string;
}

export interface FinancialModelData {
  companyName: string;
  assumptions: {
    label: string;
    value: number;
    unit: string;
  }[];
  monthlyRevenue: number[];
  monthlyCosts: number[];
  teamCosts: number[];
}

// ═══════════════════════════════════════════════════════════════
// PITCH DECK GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generatePitchDeck(data: PitchDeckData): Promise<void> {
  const pptx = new PptxGenJS();

  // Branding
  pptx.author = data.companyName;
  pptx.title = `${data.companyName} - Pitch Deck`;
  pptx.subject = 'Investor Pitch Deck';

  // Define master slide with LaunchOS branding
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      {
        rect: {
          x: 0,
          y: '93%',
          w: '100%',
          h: '7%',
          fill: { color: '9333EA' },
        },
      },
      {
        text: {
          text: data.companyName,
          options: {
            x: 0.5,
            y: '94%',
            fontSize: 10,
            color: 'FFFFFF',
            fontFace: 'Arial',
          },
        },
      },
    ],
  });

  // Slide 1: Title
  const slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide1.addText(data.companyName, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 48,
    bold: true,
    color: '9333EA',
    align: 'center',
    fontFace: 'Arial',
  });
  if (data.tagline) {
    slide1.addText(data.tagline, {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.5,
      fontSize: 24,
      color: '666666',
      align: 'center',
      fontFace: 'Arial',
    });
  }

  // Slide 2: Problem
  const slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide2.addText('Das Problem', {
    x: 0.5,
    y: 0.5,
    w: 9,
    fontSize: 32,
    bold: true,
    color: '9333EA',
    fontFace: 'Arial',
  });
  slide2.addText(data.problem, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3.5,
    fontSize: 18,
    color: '333333',
    valign: 'top',
    fontFace: 'Arial',
  });

  // Slide 3: Solution
  const slide3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide3.addText('Unsere Lösung', {
    x: 0.5,
    y: 0.5,
    w: 9,
    fontSize: 32,
    bold: true,
    color: '9333EA',
    fontFace: 'Arial',
  });
  slide3.addText(data.solution, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3.5,
    fontSize: 18,
    color: '333333',
    valign: 'top',
    fontFace: 'Arial',
  });

  // Slide 4: Market
  const slide4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide4.addText('Marktpotenzial', {
    x: 0.5,
    y: 0.5,
    w: 9,
    fontSize: 32,
    bold: true,
    color: '9333EA',
    fontFace: 'Arial',
  });
  let marketY = 1.5;
  if (data.market.tam) {
    slide4.addText(
      [
        { text: 'TAM: ', options: { bold: true } },
        { text: data.market.tam },
      ],
      { x: 0.5, y: marketY, w: 9, fontSize: 18, fontFace: 'Arial' }
    );
    marketY += 0.7;
  }
  if (data.market.sam) {
    slide4.addText(
      [
        { text: 'SAM: ', options: { bold: true } },
        { text: data.market.sam },
      ],
      { x: 0.5, y: marketY, w: 9, fontSize: 18, fontFace: 'Arial' }
    );
    marketY += 0.7;
  }
  if (data.market.som) {
    slide4.addText(
      [
        { text: 'SOM: ', options: { bold: true } },
        { text: data.market.som },
      ],
      { x: 0.5, y: marketY, w: 9, fontSize: 18, fontFace: 'Arial' }
    );
  }

  // Slide 5: Business Model
  const slide5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide5.addText('Geschäftsmodell', {
    x: 0.5,
    y: 0.5,
    w: 9,
    fontSize: 32,
    bold: true,
    color: '9333EA',
    fontFace: 'Arial',
  });
  slide5.addText(data.businessModel, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3.5,
    fontSize: 18,
    color: '333333',
    valign: 'top',
    fontFace: 'Arial',
  });

  // Slide 6: Traction (if provided)
  if (data.traction) {
    const slide6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide6.addText('Traction', {
      x: 0.5,
      y: 0.5,
      w: 9,
      fontSize: 32,
      bold: true,
      color: '9333EA',
      fontFace: 'Arial',
    });
    slide6.addText(data.traction, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3.5,
      fontSize: 18,
      color: '333333',
      valign: 'top',
      fontFace: 'Arial',
    });
  }

  // Slide 7: Team
  const slideTeam = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slideTeam.addText('Das Team', {
    x: 0.5,
    y: 0.5,
    w: 9,
    fontSize: 32,
    bold: true,
    color: '9333EA',
    fontFace: 'Arial',
  });
  data.team.forEach((member, i) => {
    const yPos = 1.5 + i * 1;
    slideTeam.addText(member.name, {
      x: 0.5,
      y: yPos,
      w: 4,
      fontSize: 18,
      bold: true,
      color: '333333',
      fontFace: 'Arial',
    });
    slideTeam.addText(member.role, {
      x: 0.5,
      y: yPos + 0.3,
      w: 4,
      fontSize: 14,
      color: '666666',
      fontFace: 'Arial',
    });
    if (member.bio) {
      slideTeam.addText(member.bio, {
        x: 4.5,
        y: yPos,
        w: 5,
        fontSize: 12,
        color: '666666',
        fontFace: 'Arial',
      });
    }
  });

  // Slide 8: Competition (if provided)
  if (data.competition) {
    const slideComp = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slideComp.addText('Wettbewerb', {
      x: 0.5,
      y: 0.5,
      w: 9,
      fontSize: 32,
      bold: true,
      color: '9333EA',
      fontFace: 'Arial',
    });
    slideComp.addText(data.competition, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3.5,
      fontSize: 18,
      color: '333333',
      valign: 'top',
      fontFace: 'Arial',
    });
  }

  // Slide 9: Financials (if provided)
  if (data.financials) {
    const slideFin = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slideFin.addText('Finanzplanung', {
      x: 0.5,
      y: 0.5,
      w: 9,
      fontSize: 32,
      bold: true,
      color: '9333EA',
      fontFace: 'Arial',
    });
    slideFin.addText(data.financials, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3.5,
      fontSize: 18,
      color: '333333',
      valign: 'top',
      fontFace: 'Arial',
    });
  }

  // Slide 10: The Ask
  const slideAsk = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slideAsk.addText('Unser Ask', {
    x: 0.5,
    y: 0.5,
    w: 9,
    fontSize: 32,
    bold: true,
    color: '9333EA',
    fontFace: 'Arial',
  });
  slideAsk.addText(data.ask, {
    x: 0.5,
    y: 1.5,
    w: 9,
    fontSize: 24,
    bold: true,
    color: 'EC4899',
    align: 'center',
    fontFace: 'Arial',
  });
  if (data.useOfFunds) {
    slideAsk.addText('Use of Funds:', {
      x: 0.5,
      y: 2.5,
      w: 9,
      fontSize: 18,
      bold: true,
      color: '333333',
      fontFace: 'Arial',
    });
    slideAsk.addText(data.useOfFunds, {
      x: 0.5,
      y: 3,
      w: 9,
      h: 2,
      fontSize: 16,
      color: '666666',
      fontFace: 'Arial',
    });
  }

  // Slide 11: Contact
  const slideContact = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slideContact.addText('Lass uns sprechen!', {
    x: 0.5,
    y: 2,
    w: 9,
    fontSize: 36,
    bold: true,
    color: '9333EA',
    align: 'center',
    fontFace: 'Arial',
  });
  slideContact.addText(data.companyName, {
    x: 0.5,
    y: 3.5,
    w: 9,
    fontSize: 24,
    color: '666666',
    align: 'center',
    fontFace: 'Arial',
  });

  // Generate and download
  const fileName = `${data.companyName.replace(/\s+/g, '_')}_Pitch_Deck.pptx`;
  await pptx.writeFile({ fileName });
}

// ═══════════════════════════════════════════════════════════════
// BUSINESS PLAN GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generateBusinessPlan(data: BusinessPlanData): Promise<void> {
  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: {
            size: 32,
            bold: true,
            color: '9333EA',
          },
          paragraph: {
            spacing: { after: 200 },
          },
        },
        heading2: {
          run: {
            size: 26,
            bold: true,
            color: '333333',
          },
          paragraph: {
            spacing: { after: 150 },
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: `Businessplan: ${data.companyName}`,
                bold: true,
                size: 48,
                color: '9333EA',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({ text: '' }),

          // Executive Summary
          new Paragraph({
            text: '1. Executive Summary',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.executiveSummary,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Team
          new Paragraph({
            text: '2. Gründerteam',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.team,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Product/Service
          new Paragraph({
            text: '3. Produkt / Dienstleistung',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.productService,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Market Analysis
          new Paragraph({
            text: '4. Markt & Wettbewerb',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.marketAnalysis,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Marketing Strategy
          new Paragraph({
            text: '5. Marketing & Vertrieb',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.marketingStrategy,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Operations
          new Paragraph({
            text: '6. Organisation & Personal',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.operations,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Financial Plan
          new Paragraph({
            text: '7. Finanzplanung',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: data.financialPlan,
            spacing: { after: 300 },
          }),
          new Paragraph({ text: '' }),

          // Risks
          new Paragraph({
            text: '8. Chancen & Risiken',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: data.risks }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.companyName.replace(/\s+/g, '_')}_Businessplan.docx`);
}

// ═══════════════════════════════════════════════════════════════
// INVESTOR LIST GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generateInvestorList(
  investors: InvestorData[],
  companyName: string
): Promise<void> {
  const worksheet = XLSX.utils.json_to_sheet(
    investors.map((inv) => ({
      Name: inv.name,
      Typ: inv.type,
      'Fokus-Bereiche': inv.focusAreas,
      'Ticket Size': inv.ticketSize,
      Portfolio: inv.portfolio,
      Kontakt: inv.contact,
      'Fit-Score': inv.fitScore,
      Notizen: inv.notes,
    }))
  );

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 15 }, // Typ
    { wch: 30 }, // Fokus
    { wch: 15 }, // Ticket
    { wch: 30 }, // Portfolio
    { wch: 30 }, // Kontakt
    { wch: 10 }, // Fit
    { wch: 40 }, // Notizen
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Investoren');

  XLSX.writeFile(workbook, `${companyName.replace(/\s+/g, '_')}_Investor_Liste.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// FINANCIAL MODEL GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generateFinancialModel(data: FinancialModelData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Assumptions
  const assumptions = data.assumptions.map((a) => ({
    Annahme: a.label,
    Wert: a.value,
    Einheit: a.unit,
  }));
  const assumptionsSheet = XLSX.utils.json_to_sheet(assumptions);
  assumptionsSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, assumptionsSheet, 'Annahmen');

  // Sheet 2: P&L
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const plData = months.map((month, i) => ({
    Monat: month,
    Umsatz: data.monthlyRevenue[i] || 0,
    Kosten: data.monthlyCosts[i] || 0,
    Team: data.teamCosts[i] || 0,
    Gewinn:
      (data.monthlyRevenue[i] || 0) - (data.monthlyCosts[i] || 0) - (data.teamCosts[i] || 0),
  }));
  const plSheet = XLSX.utils.json_to_sheet(plData);
  plSheet['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, plSheet, 'P&L');

  // Sheet 3: Cash Flow
  let runningCash = 0;
  const cashFlowData = months.map((month, i) => {
    const profit =
      (data.monthlyRevenue[i] || 0) - (data.monthlyCosts[i] || 0) - (data.teamCosts[i] || 0);
    runningCash += profit;
    return {
      Monat: month,
      Einnahmen: data.monthlyRevenue[i] || 0,
      Ausgaben: (data.monthlyCosts[i] || 0) + (data.teamCosts[i] || 0),
      Netto: profit,
      Kumuliert: runningCash,
    };
  });
  const cashFlowSheet = XLSX.utils.json_to_sheet(cashFlowData);
  cashFlowSheet['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, cashFlowSheet, 'Cash Flow');

  XLSX.writeFile(workbook, `${data.companyName.replace(/\s+/g, '_')}_Finanzmodell.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// VALUATION REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════

export interface ValuationReportData {
  companyName: string;
  date: string;
  methods: {
    name: string;
    value: number;
    confidence: number;
    notes: string[];
  }[];
  finalValuation: {
    low: number;
    mid: number;
    high: number;
  };
  assumptions: string[];
  disclaimer: string;
}

export async function generateValuationReport(data: ValuationReportData): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: `Bewertungsgutachten: ${data.companyName}`,
                bold: true,
                size: 48,
                color: '9333EA',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Erstellt am: ${data.date}`,
                size: 24,
                color: '666666',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Summary
          new Paragraph({
            text: 'Zusammenfassung',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Bewertungsspanne: ', bold: true }),
              new TextRun({
                text: `€${(data.finalValuation.low / 1000000).toFixed(1)}M - €${(data.finalValuation.high / 1000000).toFixed(1)}M`,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Mittlere Bewertung: ', bold: true }),
              new TextRun({
                text: `€${(data.finalValuation.mid / 1000000).toFixed(1)}M`,
                bold: true,
                color: '9333EA',
              }),
            ],
            spacing: { after: 300 },
          }),

          // Methods
          new Paragraph({
            text: 'Verwendete Methoden',
            heading: HeadingLevel.HEADING_1,
          }),
          ...data.methods.flatMap((method) => [
            new Paragraph({
              text: method.name,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Bewertung: ', bold: true }),
                new TextRun({ text: `€${(method.value / 1000000).toFixed(2)}M` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Konfidenz: ', bold: true }),
                new TextRun({ text: `${method.confidence}%` }),
              ],
              spacing: { after: 200 },
            }),
          ]),

          // Assumptions
          new Paragraph({
            text: 'Annahmen',
            heading: HeadingLevel.HEADING_1,
          }),
          ...data.assumptions.map(
            (assumption) =>
              new Paragraph({
                text: `• ${assumption}`,
                spacing: { after: 100 },
              })
          ),

          // Disclaimer
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Haftungsausschluss',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.disclaimer,
                size: 20,
                color: '666666',
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.companyName.replace(/\s+/g, '_')}_Bewertung.docx`);
}
