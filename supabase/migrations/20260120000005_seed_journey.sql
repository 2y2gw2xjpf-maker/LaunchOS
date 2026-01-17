-- ===========================================
-- LaunchOS Journey Seed Data
-- ===========================================
-- 35 Steps + 80+ Resources
-- Muss NACH der Hauptmigration ausgeführt werden

-- ═══════════════════════════════════════════════════════════════
-- JOURNEY STEPS (35 Steps)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO journey_steps (id, phase, category, title, description, requires, can_help, help_type, help_action, estimated_time, estimated_cost, applicable_when, sort_order) VALUES

-- FOUNDATION
('choose-legal-form', 'foundation', 'legal', 'Rechtsform wählen', 'GmbH, UG, Einzelunternehmen oder GbR? Die Wahl beeinflusst Haftung, Steuern und Investorenfähigkeit.', '{}', true, 'chat', 'Rechtsform-Beratung starten', '1-3 Stunden', NULL, '{"stage": ["idea", "building"]}', 10),
('business-plan', 'foundation', 'operations', 'Businessplan erstellen', 'Strukturierte Darstellung deiner Geschäftsidee, Marktanalyse und Finanzplanung.', '{"choose-legal-form"}', true, 'generate', 'Businessplan mit KI erstellen', '2-5 Tage', NULL, '{"funding_path": ["investor", "grant"]}', 20),
('gesellschaftsvertrag', 'foundation', 'legal', 'Gesellschaftsvertrag erstellen', 'Vertrag zwischen den Gesellschaftern - regelt Anteile, Stimmrechte, Gewinnverteilung.', '{"choose-legal-form"}', true, 'template', 'Mustervertrag anpassen', '2-5 Stunden', '0-500€', '{"company_type": ["gmbh", "ug", "gbr"]}', 30),
('bank-account', 'foundation', 'finance', 'Geschäftskonto eröffnen', 'Separates Konto für Geschäftstransaktionen. Bei GmbH/UG: Stammkapital einzahlen.', '{}', false, NULL, NULL, '1-5 Tage', '0-30€/Monat', '{}', 50),
('stammkapital', 'foundation', 'finance', 'Stammkapital einzahlen', 'Mind. 12.500€ (GmbH) oder 1€ (UG) auf das Geschäftskonto einzahlen.', '{"bank-account"}', false, NULL, NULL, '1-2 Tage', '12.500€ / ab 1€', '{"company_type": ["gmbh", "ug"]}', 60),
('accounting-setup', 'foundation', 'finance', 'Buchhaltung einrichten', 'Buchhaltungssoftware wählen und einrichten. Bei GmbH/UG ist doppelte Buchführung Pflicht.', '{"bank-account"}', true, 'chat', 'Buchhaltungs-Beratung', '2-4 Stunden', '0-30€/Monat', '{}', 180),
('steuerberater', 'foundation', 'finance', 'Steuerberater finden', 'Besonders empfohlen bei GmbH/UG. Hilft bei Jahresabschluss und Steuererklärungen.', '{}', true, 'chat', 'Steuerberater-Tipps', '1-2 Wochen', '100-500€/Monat', '{"company_type": ["gmbh", "ug"]}', 190),

-- LEGAL
('notary-appointment', 'legal', 'legal', 'Notartermin', 'Beurkundung des Gesellschaftsvertrags beim Notar - Pflicht für GmbH/UG.', '{"gesellschaftsvertrag"}', false, NULL, NULL, '1-2 Wochen', '500-1.500€', '{"company_type": ["gmbh", "ug"]}', 40),
('handelsregister', 'legal', 'legal', 'Handelsregister-Eintragung', 'Nach Notartermin und Kapitaleinzahlung: Eintragung ins Handelsregister.', '{"notary-appointment", "stammkapital"}', false, NULL, NULL, '2-4 Wochen', '150-300€', '{"company_type": ["gmbh", "ug"]}', 70),
('trade-registration', 'legal', 'legal', 'Gewerbeanmeldung', 'Anmeldung beim Gewerbeamt deiner Stadt.', '{"bank-account"}', false, NULL, NULL, '1-2 Stunden', '20-60€', '{}', 80),
('tax-registration', 'legal', 'finance', 'Steuerliche Erfassung', 'Fragebogen zur steuerlichen Erfassung beim Finanzamt.', '{"trade-registration"}', true, 'chat', 'Fragen zur steuerlichen Erfassung', '2-4 Stunden', NULL, '{}', 90),
('steuernummer', 'legal', 'finance', 'Steuernummer erhalten', 'Nach steuerlicher Erfassung erhältst du deine Steuernummer.', '{"tax-registration"}', false, NULL, NULL, '2-6 Wochen', NULL, '{}', 100),

-- BRANDING
('trademark-research', 'branding', 'legal', 'Markenrecherche', 'Prüfe ob dein Name bereits geschützt ist.', '{}', true, 'chat', 'Marken-Check durchführen', '1-2 Stunden', NULL, '{}', 110),
('trademark-registration', 'branding', 'legal', 'Markenanmeldung', 'Schütze deinen Firmennamen beim DPMA oder EUIPO.', '{"trademark-research"}', true, 'chat', 'Markenanmeldung vorbereiten', '3-6 Monate', '290-850€', '{}', 120),
('domain', 'branding', 'operations', 'Domain sichern', 'Registriere deine Wunsch-Domain.', '{}', false, NULL, NULL, '30 Min', '10-50€/Jahr', '{}', 130),
('impressum', 'legal', 'compliance', 'Impressum erstellen', 'Rechtlich vorgeschriebene Angaben auf deiner Website.', '{"trade-registration"}', true, 'generate', 'Impressum generieren', '30 Min', NULL, '{}', 140),
('privacy-policy', 'legal', 'compliance', 'Datenschutzerklärung', 'DSGVO-konforme Datenschutzerklärung.', '{}', true, 'generate', 'Datenschutzerklärung erstellen', '1-2 Stunden', NULL, '{}', 150),
('terms', 'legal', 'compliance', 'AGB erstellen', 'Allgemeine Geschäftsbedingungen.', '{}', true, 'generate', 'AGB erstellen', '2-4 Stunden', '0-500€', '{}', 160),
('cookie-banner', 'legal', 'compliance', 'Cookie Banner', 'DSGVO-konformes Cookie-Consent.', '{"privacy-policy"}', false, NULL, NULL, '1-2 Stunden', '0-20€/Monat', '{}', 170),
('liability-insurance', 'foundation', 'compliance', 'Betriebshaftpflicht', 'Schutz vor Schadenersatzansprüchen.', '{"trade-registration"}', false, NULL, NULL, '1-2 Stunden', '100-500€/Jahr', '{}', 200),

-- PRODUCT
('mvp-definition', 'product', 'product', 'MVP definieren', 'Kernfunktionen deines Minimum Viable Products bestimmen.', '{}', true, 'chat', 'MVP-Strategie entwickeln', '1-3 Tage', NULL, '{"stage": ["idea", "building"]}', 220),
('mvp-build', 'product', 'product', 'MVP bauen', 'Die einfachste Version deines Produkts erstellen.', '{"mvp-definition"}', true, 'chat', 'MVP-Beratung', '4-12 Wochen', 'Variiert', '{"stage": ["idea", "building"]}', 230),

-- LAUNCH
('beta-testers', 'launch', 'marketing', 'Beta Tester finden', 'Erste Nutzer für Feedback gewinnen.', '{"mvp-build"}', true, 'chat', 'Beta-Strategie', '2-4 Wochen', NULL, '{"stage": ["building", "mvp"]}', 240),
('first-customers', 'launch', 'marketing', 'Erste Kunden gewinnen', 'Die ersten 10-100 zahlenden Kunden.', '{"beta-testers"}', true, 'chat', 'Akquise-Strategie', 'Ongoing', NULL, '{"stage": ["mvp", "launched"]}', 250),

-- FUNDING (Investor)
('pitch-deck', 'funding', 'funding', 'Pitch Deck erstellen', '10-15 Slides für Investoren.', '{"business-plan"}', true, 'generate', 'Pitch Deck mit KI erstellen', '1-2 Wochen', NULL, '{"funding_path": ["investor"]}', 260),
('financial-model', 'funding', 'finance', 'Finanzmodell erstellen', '3-5 Jahre Finanzprojektion.', '{"business-plan"}', true, 'generate', 'Finanzmodell erstellen', '1-2 Wochen', NULL, '{"funding_path": ["investor"]}', 270),
('investor-research', 'funding', 'funding', 'Investoren recherchieren', 'Passende Angels und VCs finden.', '{"pitch-deck"}', true, 'generate', 'Investor Short-List erstellen', '1-2 Wochen', NULL, '{"funding_path": ["investor"]}', 280),
('data-room', 'funding', 'funding', 'Data Room vorbereiten', 'Dokumente für Due Diligence.', '{"pitch-deck", "financial-model"}', true, 'template', 'Data Room Struktur', '1-2 Wochen', NULL, '{"funding_path": ["investor"]}', 290),
('investor-outreach', 'funding', 'funding', 'Investoren kontaktieren', 'Cold Emails, Warm Intros, Events.', '{"investor-research", "data-room"}', true, 'generate', 'Outreach-Emails schreiben', 'Ongoing', NULL, '{"funding_path": ["investor"]}', 300),
('term-sheet', 'funding', 'funding', 'Term Sheet verhandeln', 'Konditionen mit Investoren verhandeln.', '{"investor-outreach"}', true, 'chat', 'Term Sheet Beratung', '2-4 Wochen', NULL, '{"funding_path": ["investor"]}', 310),
('due-diligence', 'funding', 'funding', 'Due Diligence', 'Detaillierte Prüfung durch Investoren.', '{"term-sheet"}', true, 'chat', 'DD-Vorbereitung', '4-8 Wochen', NULL, '{"funding_path": ["investor"]}', 320),

-- FUNDING (Bootstrap/Grant)
('grants-research', 'funding', 'funding', 'Fördermittel recherchieren', 'EXIST, KfW, regionale Programme.', '{"business-plan"}', true, 'chat', 'Fördermittel-Beratung', '1-2 Wochen', NULL, '{"funding_path": ["grant", "bootstrap"]}', 330),
('grant-application', 'funding', 'funding', 'Förderantrag stellen', 'Antrag bei EXIST, KfW, etc.', '{"grants-research"}', true, 'generate', 'Förderantrag vorbereiten', '4-8 Wochen', NULL, '{"funding_path": ["grant"]}', 340),

-- GROWTH
('profitability', 'growth', 'finance', 'Profitabilität erreichen', 'Break-Even und Gewinne.', '{"first-customers"}', true, 'chat', 'Profitabilitäts-Analyse', 'Ongoing', NULL, '{"funding_path": ["bootstrap"]}', 350)

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

-- ═══════════════════════════════════════════════════════════════
-- JOURNEY RESOURCES (80+ Links)
-- ═══════════════════════════════════════════════════════════════

-- Lösche alte Resources und füge neue ein
DELETE FROM journey_resources;

INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
-- Rechtsform
('choose-legal-form', 'official', 'IHK Gründungsratgeber', 'https://www.ihk.de/gruendung', 'Offizielle IHK Übersicht', true, 1),
('choose-legal-form', 'guide', 'Gründerplattform Rechtsform-Finder', 'https://gruenderplattform.de/rechtsform', 'Interaktiver Assistent', true, 2),
('choose-legal-form', 'official', 'BMWi Existenzgründer', 'https://www.existenzgruender.de/DE/Gruendung-vorbereiten/Rechtsform/inhalt.html', 'Vergleichstabelle', true, 3),

-- Businessplan
('business-plan', 'template', 'KfW Businessplan-Vorlage', 'https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCnden/', 'Offizielle Vorlage', true, 1),
('business-plan', 'tool', 'Gründerplattform Businessplan-Tool', 'https://gruenderplattform.de/businessplan', 'Schritt-für-Schritt', true, 2),

-- Notar
('notary-appointment', 'official', 'Bundesnotarkammer', 'https://www.bnotk.de/notarsuche', 'Notarverzeichnis', true, 1),
('notary-appointment', 'guide', 'Für-Gründer Notartermin', 'https://www.fuer-gruender.de/wissen/existenzgruendung/gmbh-gruenden/notartermin/', 'Was passiert beim Notar?', true, 2),

-- Geschäftskonto
('bank-account', 'guide', 'Geschäftskonto-Vergleich', 'https://www.fuer-gruender.de/kapital/eigenkapital/geschaeftskonto/', 'Vergleich Anbieter', true, 1),
('bank-account', 'service', 'Qonto', 'https://qonto.com/de', 'Startup-freundlich', false, 2),
('bank-account', 'service', 'N26 Business', 'https://n26.com/de-de/geschaeftskonto', 'Kostenloses Konto', true, 3),

-- Handelsregister
('handelsregister', 'official', 'Handelsregister', 'https://www.handelsregister.de', 'Offizielles Register', true, 1),

-- Gewerbeanmeldung
('trade-registration', 'official', 'BMWi Gewerbeanmeldung', 'https://www.existenzgruender.de/DE/Gruendung-vorbereiten/Gruendungswissen/Gruendungsformalitaeten/Gewerbeanmeldung/inhalt.html', 'Checkliste', true, 1),

-- Steuer
('tax-registration', 'official', 'ELSTER Fragebogen', 'https://www.elster.de/eportal/formulare-leistungen/alleformulare/fse', 'Offizielles Formular', true, 1),
('tax-registration', 'guide', 'Für-Gründer Steuerliche Erfassung', 'https://www.fuer-gruender.de/wissen/existenzgruendung/steuerliche-erfassung/', 'Anleitung', true, 2),

-- Marke
('trademark-research', 'official', 'DPMA Markenrecherche', 'https://register.dpma.de/DPMAregister/marke/einsteiger', 'Offizielle Suche', true, 1),
('trademark-research', 'official', 'EUIPO Markensuche', 'https://euipo.europa.eu/eSearch/', 'EU-weit', true, 2),
('trademark-registration', 'official', 'DPMA Anmeldung', 'https://www.dpma.de/marken/anmeldung/index.html', 'DE-Marke', true, 1),
('trademark-registration', 'official', 'EUIPO Anmeldung', 'https://euipo.europa.eu/ohimportal/de/apply-now', 'EU-Marke', true, 2),

-- Rechtliche Texte
('impressum', 'tool', 'eRecht24 Generator', 'https://www.e-recht24.de/impressum-generator.html', 'Kostenlos', true, 1),
('privacy-policy', 'tool', 'Datenschutz-Generator', 'https://datenschutz-generator.de/', 'DSGVO-konform', true, 1),
('terms', 'service', 'IT-Recht Kanzlei', 'https://www.it-recht-kanzlei.de/', 'Professionell (Abo)', false, 1),

-- Buchhaltung
('accounting-setup', 'service', 'lexoffice', 'https://www.lexoffice.de/', 'Buchhaltung', false, 1),
('accounting-setup', 'service', 'sevDesk', 'https://sevdesk.de/', 'Online-Buchhaltung', false, 2),

-- Pitch Deck
('pitch-deck', 'template', 'Sequoia Guide', 'https://www.sequoiacap.com/article/writing-a-business-plan/', 'Gold-Standard', true, 1),
('pitch-deck', 'guide', 'YC Pitch Deck Guide', 'https://www.ycombinator.com/library/4T-how-to-design-a-better-pitch-deck', 'Best Practices', true, 2),
('pitch-deck', 'template', 'Pitch Deck Hunt', 'https://www.pitchdeckhunt.com/', 'Echte Decks', true, 3),

-- Investor Research
('investor-research', 'tool', 'Crunchbase', 'https://www.crunchbase.com/', 'Investor-DB', false, 1),
('investor-research', 'guide', 'VC-Liste.de', 'https://www.vc-liste.de/', 'Deutsche VCs', true, 2),
('investor-research', 'official', 'Business Angels', 'https://www.business-angels.de/', 'BAND', true, 3),
('investor-research', 'tool', 'AngelList', 'https://angel.co/', 'International', true, 4),

-- Investor Outreach
('investor-outreach', 'guide', 'YC Email Guide', 'https://www.ycombinator.com/library/6n-how-to-email-investors', 'Best Practices', true, 1),

-- Data Room
('data-room', 'guide', 'Sequoia Checklist', 'https://www.sequoiacap.com/article/data-room-checklist/', 'Was rein muss', true, 1),
('data-room', 'service', 'DocSend', 'https://www.docsend.com/', 'Professionell', false, 2),
('data-room', 'tool', 'Notion', 'https://www.notion.so/', 'Kostenlos', true, 3),

-- Fördermittel
('grants-research', 'official', 'EXIST', 'https://www.exist.de/', 'Gründerstipendium', true, 1),
('grants-research', 'official', 'KfW Gründerkredit', 'https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCnden/', 'Kredite', true, 2),
('grants-research', 'official', 'Förderdatenbank', 'https://www.foerderdatenbank.de/', 'Alle Programme', true, 3),

-- MVP
('mvp-definition', 'guide', 'YC MVP Guide', 'https://www.ycombinator.com/library/4Q-how-to-build-an-mvp', 'Best Practices', true, 1),
('mvp-build', 'tool', 'Lovable', 'https://lovable.dev', 'AI MVP Builder', false, 1),
('mvp-build', 'tool', 'Bubble', 'https://bubble.io', 'No-Code', false, 2),

-- Erste Kunden
('first-customers', 'guide', 'YC First Customers', 'https://www.ycombinator.com/library/5b-how-to-get-your-first-customers', 'Guide', true, 1),
('first-customers', 'guide', 'Paul Graham Essay', 'http://paulgraham.com/ds.html', 'Do Things That Dont Scale', true, 2),

-- Profitabilität
('profitability', 'guide', 'YC Default Alive', 'https://www.ycombinator.com/library/4L-default-alive-or-default-dead', 'Paul Graham Essay', true, 1);
