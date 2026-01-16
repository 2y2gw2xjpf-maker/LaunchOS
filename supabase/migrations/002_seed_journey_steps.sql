-- ===========================================
-- LaunchOS Journey Steps Seed Data
-- ===========================================
-- 35 Steps für deutsche Gründer
-- Von "Rechtsform wählen" bis "Profitabilität"

-- ═══════════════════════════════════════════════════════════════
-- JOURNEY STEPS (35 Steps)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO journey_steps (id, phase, category, title, description, requires, can_help, help_type, help_action, estimated_time, estimated_cost, applicable_when, sort_order) VALUES

-- ═══════════════════════════════════════════════════════════════
-- PHASE: FOUNDATION (Grundlagen)
-- ═══════════════════════════════════════════════════════════════

('choose-legal-form', 'foundation', 'legal',
 'Rechtsform wählen',
 'GmbH, UG, Einzelunternehmen oder GbR? Die Wahl beeinflusst Haftung, Steuern und Investorenfähigkeit.',
 '{}', true, 'chat', 'Rechtsform-Beratung starten',
 '1-3 Stunden', NULL,
 '{"stage": ["idea", "building"]}', 10),

('business-plan', 'foundation', 'operations',
 'Businessplan erstellen',
 'Strukturierte Darstellung deiner Geschäftsidee, Marktanalyse und Finanzplanung. Wichtig für Investoren und Fördermittel.',
 '{"choose-legal-form"}', true, 'generate', 'Businessplan mit KI erstellen',
 '2-5 Tage', NULL,
 '{"funding_path": ["investor", "grant"]}', 20),

('gesellschaftsvertrag', 'foundation', 'legal',
 'Gesellschaftsvertrag erstellen',
 'Vertrag zwischen den Gesellschaftern - regelt Anteile, Stimmrechte, Gewinnverteilung und Nachfolge.',
 '{"choose-legal-form"}', true, 'template', 'Mustervertrag anpassen',
 '2-5 Stunden', '0-500€',
 '{"company_type": ["gmbh", "ug", "gbr"]}', 30),

('bank-account', 'foundation', 'finance',
 'Geschäftskonto eröffnen',
 'Separates Konto für Geschäftstransaktionen. Bei GmbH/UG: Stammkapital muss hier eingezahlt werden.',
 '{}', false, NULL, NULL,
 '1-5 Tage', '0-30€/Monat',
 '{}', 50),

('stammkapital', 'foundation', 'finance',
 'Stammkapital einzahlen',
 'Mind. 12.500€ (GmbH) oder mind. 1€ (UG) auf das Geschäftskonto einzahlen. Nachweis für Notar nötig.',
 '{"bank-account"}', false, NULL, NULL,
 '1-2 Tage', '12.500€ / ab 1€',
 '{"company_type": ["gmbh", "ug"]}', 60),

('accounting-setup', 'foundation', 'finance',
 'Buchhaltung einrichten',
 'Buchhaltungssoftware wählen und einrichten. Bei GmbH/UG ist doppelte Buchführung Pflicht.',
 '{"bank-account"}', true, 'chat', 'Buchhaltungs-Beratung',
 '2-4 Stunden', '0-30€/Monat',
 '{}', 180),

('steuerberater', 'foundation', 'finance',
 'Steuerberater finden',
 'Besonders empfohlen bei GmbH/UG. Hilft bei Jahresabschluss, Steuererklärungen und laufender Beratung.',
 '{}', true, 'chat', 'Steuerberater-Tipps',
 '1-2 Wochen', '100-500€/Monat',
 '{"company_type": ["gmbh", "ug"]}', 190),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: LEGAL (Rechtliche Gründung)
-- ═══════════════════════════════════════════════════════════════

('notary-appointment', 'legal', 'legal',
 'Notartermin vereinbaren',
 'Beurkundung des Gesellschaftsvertrags beim Notar - Pflicht für GmbH und UG.',
 '{"gesellschaftsvertrag"}', false, NULL, NULL,
 '1-2 Wochen', '500-1.500€',
 '{"company_type": ["gmbh", "ug"]}', 40),

('handelsregister', 'legal', 'legal',
 'Handelsregister-Eintragung',
 'Nach Notartermin und Kapitaleinzahlung: Anmeldung zur Eintragung ins Handelsregister.',
 '{"notary-appointment", "stammkapital"}', false, NULL, NULL,
 '2-4 Wochen', '150-300€',
 '{"company_type": ["gmbh", "ug"]}', 70),

('trade-registration', 'legal', 'legal',
 'Gewerbeanmeldung',
 'Anmeldung beim Gewerbeamt deiner Stadt. Online oder vor Ort möglich.',
 '{"bank-account"}', false, NULL, NULL,
 '1-2 Stunden', '20-60€',
 '{}', 80),

('tax-registration', 'legal', 'finance',
 'Steuerliche Erfassung',
 'Fragebogen zur steuerlichen Erfassung beim Finanzamt ausfüllen. Kannst du über ELSTER machen.',
 '{"trade-registration"}', true, 'chat', 'Fragen zur steuerlichen Erfassung',
 '2-4 Stunden', NULL,
 '{}', 90),

('steuernummer', 'legal', 'finance',
 'Steuernummer erhalten',
 'Nach steuerlicher Erfassung erhältst du deine Steuernummer vom Finanzamt.',
 '{"tax-registration"}', false, NULL, NULL,
 '2-6 Wochen', NULL,
 '{}', 100),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: BRANDING (Marke & Identität)
-- ═══════════════════════════════════════════════════════════════

('trademark-research', 'branding', 'legal',
 'Markenrecherche durchführen',
 'Prüfe ob dein Firmenname oder Produktname bereits als Marke geschützt ist.',
 '{}', true, 'chat', 'Marken-Check durchführen',
 '1-2 Stunden', NULL,
 '{}', 110),

('trademark-registration', 'branding', 'legal',
 'Marke anmelden',
 'Schütze deinen Firmennamen beim DPMA (Deutschland) oder EUIPO (EU-weit).',
 '{"trademark-research"}', true, 'chat', 'Markenanmeldung vorbereiten',
 '3-6 Monate', '290-850€',
 '{}', 120),

('domain', 'branding', 'operations',
 'Domain sichern',
 'Registriere deine Wunsch-Domain (.de, .com, etc.) bevor jemand anderes sie nimmt.',
 '{}', false, NULL, NULL,
 '30 Minuten', '10-50€/Jahr',
 '{}', 130),

('impressum', 'legal', 'compliance',
 'Impressum erstellen',
 'Rechtlich vorgeschriebene Angaben auf deiner Website. Pflicht für alle geschäftlichen Websites.',
 '{"trade-registration"}', true, 'generate', 'Impressum generieren',
 '30 Minuten', NULL,
 '{}', 140),

('privacy-policy', 'legal', 'compliance',
 'Datenschutzerklärung erstellen',
 'DSGVO-konforme Datenschutzerklärung für deine Website.',
 '{}', true, 'generate', 'Datenschutzerklärung erstellen',
 '1-2 Stunden', NULL,
 '{}', 150),

('terms', 'legal', 'compliance',
 'AGB erstellen',
 'Allgemeine Geschäftsbedingungen für dein Produkt oder Service.',
 '{}', true, 'generate', 'AGB erstellen',
 '2-4 Stunden', '0-500€',
 '{}', 160),

('cookie-banner', 'legal', 'compliance',
 'Cookie Banner einrichten',
 'DSGVO-konformes Cookie-Consent für deine Website.',
 '{"privacy-policy"}', false, NULL, NULL,
 '1-2 Stunden', '0-20€/Monat',
 '{}', 170),

('liability-insurance', 'foundation', 'compliance',
 'Betriebshaftpflicht abschließen',
 'Schutz vor Schadenersatzansprüchen durch Dritte.',
 '{"trade-registration"}', false, NULL, NULL,
 '1-2 Stunden', '100-500€/Jahr',
 '{}', 200),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: PRODUCT (Produktentwicklung)
-- ═══════════════════════════════════════════════════════════════

('mvp-definition', 'product', 'product',
 'MVP definieren',
 'Kernfunktionen deines Minimum Viable Products bestimmen. Was ist das Minimum, das du brauchst?',
 '{}', true, 'chat', 'MVP-Strategie entwickeln',
 '1-3 Tage', NULL,
 '{"stage": ["idea", "building"]}', 220),

('mvp-build', 'product', 'product',
 'MVP bauen',
 'Die einfachste Version deines Produkts erstellen, die das Kernproblem löst.',
 '{"mvp-definition"}', true, 'chat', 'MVP-Beratung',
 '4-12 Wochen', 'Variiert',
 '{"stage": ["idea", "building"]}', 230),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: LAUNCH (Markteinführung)
-- ═══════════════════════════════════════════════════════════════

('beta-testers', 'launch', 'marketing',
 'Beta Tester finden',
 'Erste Nutzer für Feedback gewinnen. Familie, Freunde, LinkedIn, Twitter...',
 '{"mvp-build"}', true, 'chat', 'Beta-Strategie entwickeln',
 '2-4 Wochen', NULL,
 '{"stage": ["building", "mvp"]}', 240),

('first-customers', 'launch', 'marketing',
 'Erste Kunden gewinnen',
 'Die ersten 10-100 zahlenden Kunden. Do things that dont scale.',
 '{"beta-testers"}', true, 'chat', 'Akquise-Strategie entwickeln',
 'Ongoing', NULL,
 '{"stage": ["mvp", "launched"]}', 250),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: FUNDING - INVESTOR PATH
-- ═══════════════════════════════════════════════════════════════

('pitch-deck', 'funding', 'funding',
 'Pitch Deck erstellen',
 '10-15 Slides für Investoren. Problem, Lösung, Markt, Team, Finanzen, Ask.',
 '{"business-plan"}', true, 'generate', 'Pitch Deck mit KI erstellen',
 '1-2 Wochen', NULL,
 '{"funding_path": ["investor"]}', 260),

('financial-model', 'funding', 'finance',
 'Finanzmodell erstellen',
 '3-5 Jahre Finanzprojektion mit Revenue, Costs, Cash Flow.',
 '{"business-plan"}', true, 'generate', 'Finanzmodell erstellen',
 '1-2 Wochen', NULL,
 '{"funding_path": ["investor"]}', 270),

('investor-research', 'funding', 'funding',
 'Investoren recherchieren',
 'Passende Angels und VCs für deine Branche und Stage finden.',
 '{"pitch-deck"}', true, 'generate', 'Investor Short-List erstellen',
 '1-2 Wochen', NULL,
 '{"funding_path": ["investor"]}', 280),

('data-room', 'funding', 'funding',
 'Data Room vorbereiten',
 'Dokumente für Due Diligence: Gesellschaftsvertrag, Finanzen, IP, Team, Kunden.',
 '{"pitch-deck", "financial-model"}', true, 'template', 'Data Room Struktur erstellen',
 '1-2 Wochen', NULL,
 '{"funding_path": ["investor"]}', 290),

('investor-outreach', 'funding', 'funding',
 'Investoren kontaktieren',
 'Cold Emails, Warm Intros über dein Netzwerk, Events, Demo Days.',
 '{"investor-research", "data-room"}', true, 'generate', 'Outreach-Emails schreiben',
 'Ongoing', NULL,
 '{"funding_path": ["investor"]}', 300),

('term-sheet', 'funding', 'funding',
 'Term Sheet verhandeln',
 'Konditionen mit Investoren verhandeln: Bewertung, Anteile, Board Seats, Liquidation Preference.',
 '{"investor-outreach"}', true, 'chat', 'Term Sheet Beratung',
 '2-4 Wochen', NULL,
 '{"funding_path": ["investor"]}', 310),

('due-diligence', 'funding', 'funding',
 'Due Diligence durchlaufen',
 'Detaillierte Prüfung durch Investoren. Sei vorbereitet auf viele Fragen.',
 '{"term-sheet"}', true, 'chat', 'DD-Vorbereitung',
 '4-8 Wochen', NULL,
 '{"funding_path": ["investor"]}', 320),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: FUNDING - BOOTSTRAP/GRANT PATH
-- ═══════════════════════════════════════════════════════════════

('grants-research', 'funding', 'funding',
 'Fördermittel recherchieren',
 'EXIST Gründerstipendium, KfW Gründerkredit, regionale Programme finden.',
 '{"business-plan"}', true, 'chat', 'Fördermittel-Beratung',
 '1-2 Wochen', NULL,
 '{"funding_path": ["grant", "bootstrap"]}', 330),

('grant-application', 'funding', 'funding',
 'Förderantrag stellen',
 'Antrag bei EXIST, KfW, oder regionalen Programmen einreichen.',
 '{"grants-research"}', true, 'generate', 'Förderantrag vorbereiten',
 '4-8 Wochen', NULL,
 '{"funding_path": ["grant"]}', 340),

-- ═══════════════════════════════════════════════════════════════
-- PHASE: GROWTH (Wachstum)
-- ═══════════════════════════════════════════════════════════════

('profitability', 'growth', 'finance',
 'Profitabilität erreichen',
 'Break-Even erreichen und nachhaltige Gewinne erzielen.',
 '{"first-customers"}', true, 'chat', 'Profitabilitäts-Analyse',
 'Ongoing', NULL,
 '{"funding_path": ["bootstrap"]}', 350)

ON CONFLICT (id) DO UPDATE SET
  phase = EXCLUDED.phase,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requires = EXCLUDED.requires,
  can_help = EXCLUDED.can_help,
  help_type = EXCLUDED.help_type,
  help_action = EXCLUDED.help_action,
  estimated_time = EXCLUDED.estimated_time,
  estimated_cost = EXCLUDED.estimated_cost,
  applicable_when = EXCLUDED.applicable_when,
  sort_order = EXCLUDED.sort_order;
