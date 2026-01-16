-- ===========================================
-- LaunchOS Journey Resources Seed Data
-- ===========================================
-- 80+ offizielle deutsche Quellen
-- IHK, DPMA, KfW, ELSTER, BMWi, etc.

-- Lösche alte Resources falls vorhanden
DELETE FROM journey_resources;

-- ═══════════════════════════════════════════════════════════════
-- FOUNDATION RESOURCES
-- ═══════════════════════════════════════════════════════════════

-- Rechtsform wählen
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('choose-legal-form', 'official', 'IHK Gründungsratgeber', 'https://www.ihk.de/gruendung', 'Offizielle IHK Übersicht zu allen Rechtsformen', true, 1),
('choose-legal-form', 'guide', 'Gründerplattform Rechtsform-Finder', 'https://gruenderplattform.de/rechtsform', 'Interaktiver Assistent zur Rechtsformwahl', true, 2),
('choose-legal-form', 'official', 'BMWi Existenzgründer', 'https://www.existenzgruender.de/DE/Gruendung-vorbereiten/Rechtsform/inhalt.html', 'Offizielle Vergleichstabelle des Bundesministeriums', true, 3),
('choose-legal-form', 'guide', 'Für-Gründer Rechtsform-Vergleich', 'https://www.fuer-gruender.de/wissen/existenzgruendung/rechtsform/', 'Detaillierter Vergleich mit Vor- und Nachteilen', true, 4);

-- Businessplan
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('business-plan', 'template', 'KfW Businessplan-Vorlage', 'https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCnden/', 'Offizielle Vorlage der KfW Bank', true, 1),
('business-plan', 'tool', 'Gründerplattform Businessplan-Tool', 'https://gruenderplattform.de/businessplan', 'Schritt-für-Schritt Online-Tool', true, 2),
('business-plan', 'guide', 'IHK Businessplan Leitfaden', 'https://www.ihk.de/themen/existenzgruendung-und-unternehmensfoerderung/businessplan', 'IHK Anleitung mit Muster', true, 3),
('business-plan', 'template', 'BMWi Businessplan Muster', 'https://www.existenzgruender.de/SharedDocs/Downloads/DE/Checklisten-Uebersichten/Businessplan.html', 'Offizielles Muster vom Ministerium', true, 4);

-- Gesellschaftsvertrag
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('gesellschaftsvertrag', 'template', 'IHK Mustervertrag GmbH', 'https://www.ihk.de/themen/recht-und-steuern/gesellschaftsrecht/gmbh', 'Mustervertrag der IHK', true, 1),
('gesellschaftsvertrag', 'guide', 'Für-Gründer Gesellschaftsvertrag', 'https://www.fuer-gruender.de/wissen/existenzgruendung/gmbh-gruenden/gesellschaftsvertrag/', 'Was muss rein?', true, 2),
('gesellschaftsvertrag', 'service', 'Notar.de', 'https://www.notar.de/', 'Notarsuche und Informationen', true, 3);

-- Geschäftskonto
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('bank-account', 'guide', 'Geschäftskonto-Vergleich', 'https://www.fuer-gruender.de/kapital/eigenkapital/geschaeftskonto/', 'Vergleich aller Anbieter', true, 1),
('bank-account', 'service', 'Qonto', 'https://qonto.com/de', 'Startup-freundliches Online-Geschäftskonto', false, 2),
('bank-account', 'service', 'N26 Business', 'https://n26.com/de-de/geschaeftskonto', 'Kostenloses Geschäftskonto', true, 3),
('bank-account', 'service', 'Holvi', 'https://www.holvi.com/de/', 'Geschäftskonto für Selbstständige', false, 4),
('bank-account', 'service', 'Fyrst', 'https://www.fyrst.de/', 'Deutsche Bank Startup-Konto', false, 5);

-- Stammkapital
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('stammkapital', 'official', 'IHK Stammkapital Info', 'https://www.ihk.de/themen/existenzgruendung-und-unternehmensfoerderung/gmbh-gruendung', 'Offizielle Informationen zum Stammkapital', true, 1),
('stammkapital', 'guide', 'Für-Gründer Stammkapital', 'https://www.fuer-gruender.de/wissen/existenzgruendung/gmbh-gruenden/stammkapital/', 'Alles zum Stammkapital', true, 2);

-- Buchhaltung
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('accounting-setup', 'service', 'lexoffice', 'https://www.lexoffice.de/', 'Online-Buchhaltung für Startups', false, 1),
('accounting-setup', 'service', 'sevDesk', 'https://sevdesk.de/', 'Cloud-Buchhaltung', false, 2),
('accounting-setup', 'service', 'FastBill', 'https://www.fastbill.com/', 'Rechnungen und Buchhaltung', false, 3),
('accounting-setup', 'guide', 'Für-Gründer Buchhaltung', 'https://www.fuer-gruender.de/wissen/unternehmen-fuehren/buchhaltung/', 'Buchhaltung Grundlagen', true, 4);

-- Steuerberater
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('steuerberater', 'official', 'Steuerberatersuche', 'https://www.steuerberater-suchservice.de/', 'Offizielle Steuerberatersuche', true, 1),
('steuerberater', 'service', 'Kontist', 'https://kontist.com/', 'Banking + Steuer für Selbstständige', false, 2),
('steuerberater', 'guide', 'Für-Gründer Steuerberater', 'https://www.fuer-gruender.de/wissen/unternehmen-fuehren/steuern/steuerberater/', 'Tipps zur Steuerberater-Wahl', true, 3);

-- ═══════════════════════════════════════════════════════════════
-- LEGAL RESOURCES
-- ═══════════════════════════════════════════════════════════════

-- Notar
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('notary-appointment', 'official', 'Bundesnotarkammer', 'https://www.bnotk.de/notarsuche', 'Offizielles Notarverzeichnis', true, 1),
('notary-appointment', 'guide', 'Für-Gründer Notartermin', 'https://www.fuer-gruender.de/wissen/existenzgruendung/gmbh-gruenden/notartermin/', 'Was passiert beim Notar?', true, 2),
('notary-appointment', 'official', 'Notar.de Suche', 'https://www.notar.de/notarsuche', 'Notar in deiner Nähe finden', true, 3);

-- Handelsregister
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('handelsregister', 'official', 'Handelsregister', 'https://www.handelsregister.de', 'Offizielles Handelsregister', true, 1),
('handelsregister', 'official', 'Unternehmensregister', 'https://www.unternehmensregister.de', 'Bundesanzeiger Unternehmensregister', true, 2),
('handelsregister', 'guide', 'IHK Handelsregister', 'https://www.ihk.de/themen/recht-und-steuern/handels-und-gesellschaftsrecht/handelsregister', 'IHK Informationen', true, 3);

-- Gewerbeanmeldung
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('trade-registration', 'official', 'BMWi Gewerbeanmeldung', 'https://www.existenzgruender.de/DE/Gruendung-vorbereiten/Gruendungswissen/Gruendungsformalitaeten/Gewerbeanmeldung/inhalt.html', 'Offizielle Checkliste', true, 1),
('trade-registration', 'tool', 'Gewerbeanmeldung Online', 'https://www.gewerbeanmeldung.de/', 'Online-Anmeldung (stadtabhängig)', true, 2),
('trade-registration', 'guide', 'Für-Gründer Gewerbe', 'https://www.fuer-gruender.de/wissen/existenzgruendung/gruendungsformalitaeten/gewerbeanmeldung/', 'Schritt-für-Schritt Anleitung', true, 3);

-- Steuerliche Erfassung
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('tax-registration', 'official', 'ELSTER Fragebogen', 'https://www.elster.de/eportal/formulare-leistungen/alleformulare/fse', 'Offizielles Formular online', true, 1),
('tax-registration', 'guide', 'Für-Gründer Steuerliche Erfassung', 'https://www.fuer-gruender.de/wissen/existenzgruendung/steuerliche-erfassung/', 'Anleitung zum Ausfüllen', true, 2),
('tax-registration', 'guide', 'BMWi Steuern', 'https://www.existenzgruender.de/DE/Gruendung-vorbereiten/Gruendungswissen/Gruendungsformalitaeten/Finanzamt/inhalt.html', 'Ministeriums-Infos', true, 3);

-- Steuernummer
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('steuernummer', 'official', 'ELSTER Portal', 'https://www.elster.de/', 'Online-Steuererklärung', true, 1),
('steuernummer', 'official', 'Bundeszentralamt für Steuern', 'https://www.bzst.de/', 'USt-ID beantragen', true, 2);

-- ═══════════════════════════════════════════════════════════════
-- BRANDING RESOURCES
-- ═══════════════════════════════════════════════════════════════

-- Markenrecherche
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('trademark-research', 'official', 'DPMA Markenrecherche', 'https://register.dpma.de/DPMAregister/marke/einsteiger', 'Offizielle deutsche Markensuche', true, 1),
('trademark-research', 'official', 'EUIPO Markensuche', 'https://euipo.europa.eu/eSearch/', 'EU-weite Markensuche', true, 2),
('trademark-research', 'official', 'WIPO Global Brand', 'https://www.wipo.int/branddb/en/', 'Weltweite Markensuche', true, 3),
('trademark-research', 'guide', 'Für-Gründer Markenrecherche', 'https://www.fuer-gruender.de/wissen/existenzgruendung/marke/markenrecherche/', 'Anleitung zur Recherche', true, 4);

-- Markenanmeldung
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('trademark-registration', 'official', 'DPMA Markenanmeldung', 'https://www.dpma.de/marken/anmeldung/index.html', 'Deutsche Marke anmelden (290€)', true, 1),
('trademark-registration', 'official', 'EUIPO Anmeldung', 'https://euipo.europa.eu/ohimportal/de/apply-now', 'EU-Marke anmelden (850€)', true, 2),
('trademark-registration', 'guide', 'IHK Markenschutz', 'https://www.ihk.de/themen/recht-und-steuern/gewerblicher-rechtsschutz/marken', 'IHK Informationen', true, 3);

-- Domain
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('domain', 'service', 'DENIC', 'https://www.denic.de/', 'Offizielle .de Registry', true, 1),
('domain', 'service', 'United Domains', 'https://www.united-domains.de/', 'Deutscher Domain-Anbieter', false, 2),
('domain', 'service', 'Namecheap', 'https://www.namecheap.com/', 'Günstiger internationaler Anbieter', false, 3);

-- Impressum
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('impressum', 'tool', 'eRecht24 Impressum Generator', 'https://www.e-recht24.de/impressum-generator.html', 'Kostenloser Generator', true, 1),
('impressum', 'official', 'BMJ Telemediengesetz', 'https://www.gesetze-im-internet.de/tmg/__5.html', 'Gesetzliche Grundlage', true, 2),
('impressum', 'guide', 'Für-Gründer Impressum', 'https://www.fuer-gruender.de/wissen/unternehmen-fuehren/internet/impressum/', 'Was muss rein?', true, 3);

-- Datenschutz
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('privacy-policy', 'tool', 'Datenschutz-Generator.de', 'https://datenschutz-generator.de/', 'DSGVO-konformer Generator', true, 1),
('privacy-policy', 'official', 'BfDI DSGVO', 'https://www.bfdi.bund.de/DE/Datenschutz/datenschutz-node.html', 'Bundesbeauftragter für Datenschutz', true, 2),
('privacy-policy', 'guide', 'Für-Gründer Datenschutz', 'https://www.fuer-gruender.de/wissen/unternehmen-fuehren/datenschutz/', 'DSGVO für Startups', true, 3);

-- AGB
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('terms', 'service', 'IT-Recht Kanzlei', 'https://www.it-recht-kanzlei.de/', 'Rechtssichere AGB (Abo)', false, 1),
('terms', 'service', 'Händlerbund', 'https://www.haendlerbund.de/', 'E-Commerce Rechtstexte', false, 2),
('terms', 'guide', 'IHK AGB Info', 'https://www.ihk.de/themen/recht-und-steuern/vertragsrecht/agb', 'IHK Grundlagen', true, 3);

-- Cookie Banner
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('cookie-banner', 'service', 'Cookiebot', 'https://www.cookiebot.com/de/', 'DSGVO-konforme Lösung', false, 1),
('cookie-banner', 'service', 'Usercentrics', 'https://usercentrics.com/de/', 'Enterprise Cookie Consent', false, 2),
('cookie-banner', 'tool', 'Osano', 'https://www.osano.com/', 'Kostenlose Basis-Version', true, 3);

-- Betriebshaftpflicht
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('liability-insurance', 'service', 'Hiscox', 'https://www.hiscox.de/', 'Startup-Versicherungen', false, 1),
('liability-insurance', 'service', 'Exali', 'https://www.exali.de/', 'IT & Berater Versicherung', false, 2),
('liability-insurance', 'guide', 'Für-Gründer Versicherungen', 'https://www.fuer-gruender.de/wissen/unternehmen-absichern/betriebshaftpflicht/', 'Übersicht Versicherungen', true, 3);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT RESOURCES
-- ═══════════════════════════════════════════════════════════════

-- MVP Definition
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('mvp-definition', 'guide', 'YC MVP Guide', 'https://www.ycombinator.com/library/4Q-how-to-build-an-mvp', 'Y Combinator Best Practices', true, 1),
('mvp-definition', 'guide', 'Lean Startup Methode', 'https://theleanstartup.com/', 'Eric Ries Lean Startup', true, 2),
('mvp-definition', 'guide', 'Für-Gründer MVP', 'https://www.fuer-gruender.de/wissen/geschaeftsidee-finden/minimum-viable-product/', 'Deutsche MVP Anleitung', true, 3);

-- MVP Build
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('mvp-build', 'tool', 'Lovable', 'https://lovable.dev', 'AI MVP Builder', false, 1),
('mvp-build', 'tool', 'Bubble', 'https://bubble.io', 'No-Code Platform', false, 2),
('mvp-build', 'tool', 'Webflow', 'https://webflow.com/', 'No-Code Website Builder', false, 3),
('mvp-build', 'tool', 'Framer', 'https://www.framer.com/', 'Design to Website', false, 4);

-- ═══════════════════════════════════════════════════════════════
-- LAUNCH RESOURCES
-- ═══════════════════════════════════════════════════════════════

-- Beta Tester
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('beta-testers', 'guide', 'YC First Users', 'https://www.ycombinator.com/library/5b-how-to-get-your-first-customers', 'YC Guide für erste Nutzer', true, 1),
('beta-testers', 'tool', 'Product Hunt', 'https://www.producthunt.com/', 'Launch Platform', true, 2),
('beta-testers', 'tool', 'BetaList', 'https://betalist.com/', 'Beta Tester Community', true, 3);

-- Erste Kunden
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('first-customers', 'guide', 'Paul Graham: Do Things That Dont Scale', 'http://paulgraham.com/ds.html', 'Klassiker Essay', true, 1),
('first-customers', 'guide', 'YC Sales', 'https://www.ycombinator.com/library/6v-how-to-sell', 'Startup Sales Guide', true, 2),
('first-customers', 'guide', 'Für-Gründer Kundenakquise', 'https://www.fuer-gruender.de/wissen/unternehmen-fuehren/marketing/kundenakquise/', 'Deutsche Akquise-Tipps', true, 3);

-- ═══════════════════════════════════════════════════════════════
-- FUNDING RESOURCES - INVESTOR
-- ═══════════════════════════════════════════════════════════════

-- Pitch Deck
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('pitch-deck', 'template', 'Sequoia Pitch Deck', 'https://www.sequoiacap.com/article/writing-a-business-plan/', 'Der Gold-Standard', true, 1),
('pitch-deck', 'guide', 'YC Pitch Deck Guide', 'https://www.ycombinator.com/library/4T-how-to-design-a-better-pitch-deck', 'YC Best Practices', true, 2),
('pitch-deck', 'template', 'Pitch Deck Hunt', 'https://www.pitchdeckhunt.com/', 'Echte erfolgreiche Decks', true, 3),
('pitch-deck', 'template', 'Slidebean Decks', 'https://slidebean.com/pitch-deck-examples', 'Pitch Deck Templates', true, 4);

-- Finanzmodell
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('financial-model', 'template', 'Standard Metrics Template', 'https://www.saastr.com/saastr-launches-16-key-saas-metrics-template/', 'SaaS Metriken Template', true, 1),
('financial-model', 'guide', 'YC Startup Metrics', 'https://www.ycombinator.com/library/8c-startup-metrics', 'Welche Metriken wichtig sind', true, 2),
('financial-model', 'template', 'Christoph Janz SaaS Model', 'https://christophjanz.blogspot.com/2016/03/saas-financial-model-20.html', 'Bekanntes SaaS Model', true, 3);

-- Investor Research
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('investor-research', 'tool', 'Crunchbase', 'https://www.crunchbase.com/', 'Investor-Datenbank', false, 1),
('investor-research', 'guide', 'VC-Liste.de', 'https://www.vc-liste.de/', 'Deutsche VCs Liste', true, 2),
('investor-research', 'official', 'Business Angels Netzwerk', 'https://www.business-angels.de/', 'BAND Verzeichnis', true, 3),
('investor-research', 'tool', 'AngelList', 'https://angel.co/', 'International Angels & VCs', true, 4),
('investor-research', 'tool', 'Dealroom', 'https://dealroom.co/', 'European Startup Database', false, 5);

-- Data Room
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('data-room', 'guide', 'Sequoia Data Room Checklist', 'https://www.sequoiacap.com/article/data-room-checklist/', 'Was in den Data Room muss', true, 1),
('data-room', 'service', 'DocSend', 'https://www.docsend.com/', 'Professioneller Data Room', false, 2),
('data-room', 'tool', 'Notion', 'https://www.notion.so/', 'Kostenloser Data Room', true, 3),
('data-room', 'service', 'Google Drive', 'https://drive.google.com/', 'Einfache Lösung', true, 4);

-- Investor Outreach
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('investor-outreach', 'guide', 'YC Investor Email Guide', 'https://www.ycombinator.com/library/6n-how-to-email-investors', 'Wie man Investoren anschreibt', true, 1),
('investor-outreach', 'guide', 'Jason Calacanis Email Tips', 'https://calacanis.com/how-to-send-a-cold-email/', 'Cold Email Best Practices', true, 2);

-- Term Sheet
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('term-sheet', 'guide', 'YC Term Sheet Guide', 'https://www.ycombinator.com/library/4j-term-sheets-and-fundraising', 'YC Erklärung', true, 1),
('term-sheet', 'template', 'YC SAFE', 'https://www.ycombinator.com/documents/', 'Einfaches Investmentdokument', true, 2),
('term-sheet', 'guide', 'Brad Feld Term Sheet', 'https://feld.com/archives/category/term-sheet', 'Detaillierte Erklärungen', true, 3);

-- Due Diligence
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('due-diligence', 'guide', 'YC DD Prep', 'https://www.ycombinator.com/library', 'Vorbereitung auf DD', true, 1),
('due-diligence', 'template', 'Due Diligence Checklist', 'https://www.cooleygo.com/due-diligence/', 'Cooley Go Checklist', true, 2);

-- ═══════════════════════════════════════════════════════════════
-- FUNDING RESOURCES - BOOTSTRAP/GRANT
-- ═══════════════════════════════════════════════════════════════

-- Fördermittel
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('grants-research', 'official', 'EXIST Gründerstipendium', 'https://www.exist.de/', 'Bis zu 3.000€/Monat für 12 Monate', true, 1),
('grants-research', 'official', 'KfW Gründerkredit', 'https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCnden/', 'Kredite und Zuschüsse', true, 2),
('grants-research', 'official', 'Förderdatenbank', 'https://www.foerderdatenbank.de/', 'Alle Förderprogramme durchsuchen', true, 3),
('grants-research', 'official', 'INVEST Zuschuss', 'https://www.bafa.de/DE/Wirtschaft/Existenzgruendung_Investitionen/invest/invest_node.html', '25% Zuschuss für Business Angels', true, 4),
('grants-research', 'official', 'High-Tech Gründerfonds', 'https://www.htgf.de/', 'Seed VC mit staatlicher Beteiligung', true, 5);

-- Förderantrag
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('grant-application', 'official', 'EXIST Antrag', 'https://www.exist.de/EXIST/Navigation/DE/Gruendungsfoerderung/EXIST-Gruenderstipendium/exist-gruenderstipendium.html', 'Antragsstellung EXIST', true, 1),
('grant-application', 'guide', 'Für-Gründer EXIST', 'https://www.fuer-gruender.de/kapital/eigenkapital/exist-gruenderstipendium/', 'Tipps für den Antrag', true, 2);

-- ═══════════════════════════════════════════════════════════════
-- GROWTH RESOURCES
-- ═══════════════════════════════════════════════════════════════

-- Profitabilität
INSERT INTO journey_resources (step_id, type, title, url, description, is_free, sort_order) VALUES
('profitability', 'guide', 'YC Default Alive', 'https://www.ycombinator.com/library/4L-default-alive-or-default-dead', 'Paul Graham Essay', true, 1),
('profitability', 'guide', 'SaaStr Break Even', 'https://www.saastr.com/when-should-a-saas-company-become-profitable/', 'Wann profitabel werden?', true, 2),
('profitability', 'guide', 'Indie Hackers', 'https://www.indiehackers.com/', 'Bootstrap Community', true, 3);
