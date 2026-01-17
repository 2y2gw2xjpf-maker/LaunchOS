-- ══════════════════════════════════════════════════════════════
-- SEED DATA: CATEGORIES (Idempotent with ON CONFLICT)
-- ══════════════════════════════════════════════════════════════

INSERT INTO toolkit_categories (slug, name, description, icon, color, sort_order) VALUES
('getting-started', 'Erste Schritte', 'Grundlagen für absolute Anfänger', 'Rocket', '#9333ea', 1),
('tool-guides', 'Tool-Guides', 'Anleitungen für spezifische Tools', 'Wrench', '#3b82f6', 2),
('architecture', 'Architektur', 'Technische Grundlagen und Entscheidungen', 'Building', '#10b981', 3),
('database', 'Datenbank', 'Supabase, Migrations, Schema-Design', 'Database', '#f59e0b', 4),
('auth', 'Authentifizierung', 'Login, Sessions, Sicherheit', 'Shield', '#ef4444', 5),
('deployment', 'Deployment', 'Go-Live, Hosting, CI/CD', 'Cloud', '#8b5cf6', 6),
('best-practices', 'Best Practices', 'Tipps aus der Praxis', 'Lightbulb', '#ec4899', 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ══════════════════════════════════════════════════════════════
-- SEED DATA: TOOLS (Idempotent with ON CONFLICT)
-- ══════════════════════════════════════════════════════════════

INSERT INTO toolkit_tools (
  slug, name, tagline, description, website_url, docs_url,
  rating_ui, rating_backend, rating_database, rating_deployment, rating_learning_curve,
  strengths, weaknesses, best_for, not_for,
  pricing_model, pricing_details, tech_stack, integrations,
  pro_tips, common_mistakes, color, sort_order, is_featured
) VALUES

-- LOVABLE
(
  'lovable',
  'Lovable',
  'Build software with AI',
  'Lovable generiert React-Anwendungen mit schönen UIs basierend auf natürlicher Sprache. Ideal für schnelle Prototypen und Landing Pages.',
  'https://lovable.dev',
  'https://docs.lovable.dev',
  5, 2, 2, 3, 5,
  ARRAY['Sehr schnelle UI-Generierung', 'Hervorragendes Design out-of-the-box', 'Einfache natürliche Sprache', 'Gute Tailwind-Integration', 'Schnelle Iterationen'],
  ARRAY['Kein echtes Backend', 'Begrenzte Datenbank-Integration', 'Schwierig bei komplexer Logik', 'Vendor Lock-in', 'Limitierte Customization'],
  ARRAY['Landing Pages', 'Marketing-Seiten', 'Schnelle Prototypen', 'UI-Mockups', 'einfache CRUD-Apps'],
  ARRAY['Komplexe Business-Logik', 'Custom Backend', 'Datenintensive Apps', 'Enterprise-Software'],
  'freemium',
  'Free Tier verfügbar, Pro ab $20/Monat',
  ARRAY['React', 'Tailwind CSS', 'Vite', 'Supabase (optional)'],
  ARRAY['Supabase', 'Vercel', 'GitHub'],
  ARRAY[
    'Nutze Lovable für das UI, aber baue das Backend separat mit Supabase Edge Functions',
    'Exportiere den Code und arbeite lokal weiter sobald es komplexer wird',
    'Beschreibe das gewünschte Design sehr detailliert für bessere Ergebnisse',
    'Nutze Screenshots von Designs die dir gefallen als Referenz'
  ],
  ARRAY[
    'Denken dass Lovable ein vollständiges Produkt generiert - es ist primär ein UI-Generator',
    'Keine eigene Supabase-Instanz aufsetzen und bei Lovables Datenbank bleiben',
    'Komplexe State-Logik in Lovable implementieren wollen',
    'API-Keys direkt im generierten Frontend-Code verwenden'
  ],
  '#ff6b6b',
  1,
  true
),

-- BOLT.NEW
(
  'bolt',
  'Bolt.new',
  'Full-stack web development in the browser',
  'Bolt.new von StackBlitz ermöglicht das Erstellen kompletter Full-Stack-Anwendungen direkt im Browser. Stärker als Lovable bei Backend-Funktionalität.',
  'https://bolt.new',
  'https://bolt.new/docs',
  4, 3, 3, 4, 4,
  ARRAY['Full-Stack im Browser', 'Echte Backend-Funktionalität', 'Gute API-Integration', 'Schnelles Deployment', 'WebContainer-Technologie'],
  ARRAY['Weniger polished UI als Lovable', 'Manchmal instabil', 'Browser-basierte Limitierungen', 'Weniger Community-Support'],
  ARRAY['Full-Stack MVPs', 'API-basierte Apps', 'Schnelle Experimente', 'Proof of Concepts'],
  ARRAY['Sehr komplexe Apps', 'Native Mobile Apps', 'High-Performance Apps'],
  'freemium',
  'Free Tier großzügig, Pro für mehr Ressourcen',
  ARRAY['Next.js', 'React', 'Node.js', 'Various databases'],
  ARRAY['Vercel', 'Netlify', 'GitHub', 'npm'],
  ARRAY[
    'Nutze Bolt für schnelle Full-Stack Prototypen die mehr als nur UI brauchen',
    'Exportiere zu GitHub sobald du zufrieden bist und arbeite lokal weiter',
    'Bolt ist gut für API-Routes und Server-Side Logic',
    'Kombiniere mit externen Services für Datenbanken'
  ],
  ARRAY[
    'Sich auf Bolt als Production-Umgebung verlassen',
    'Große Datenmengen im Browser verarbeiten wollen',
    'Nicht regelmäßig den Code exportieren und sichern'
  ],
  '#00d4aa',
  2,
  true
),

-- CURSOR
(
  'cursor',
  'Cursor',
  'The AI Code Editor',
  'Cursor ist ein VS Code Fork mit integrierter AI. Ideal für Entwickler die mehr Kontrolle wollen und lokal arbeiten möchten.',
  'https://cursor.sh',
  'https://docs.cursor.sh',
  3, 5, 5, 4, 3,
  ARRAY['Volle IDE-Funktionalität', 'Lokale Entwicklung', 'Maximale Kontrolle', 'Gute Code-Qualität', 'Multi-File Editing', 'Composer für komplexe Tasks'],
  ARRAY['Steilere Lernkurve', 'Erfordert Dev-Setup', 'Nicht für absolute Anfänger', 'Kostet für Pro-Features'],
  ARRAY['Komplexe Projekte', 'Bestehende Codebases', 'Professional Development', 'Custom Backends'],
  ARRAY['Absolute Anfänger', 'Schnelle Prototypen ohne Setup'],
  'freemium',
  'Free Tier mit Limits, Pro $20/Monat, Business verfügbar',
  ARRAY['VS Code', 'Claude/GPT', 'Local Development'],
  ARRAY['Alle VS Code Extensions', 'Git', 'Docker', 'Databases'],
  ARRAY[
    'Nutze den Composer (@codebase) für projektweite Änderungen',
    'Erstelle .cursorrules für projekt-spezifische Anweisungen',
    'Nutze Cmd+K für inline Edits, Cmd+L für Chat',
    'Indexiere dein Projekt für besseren Kontext',
    'Nutze @docs um Dokumentation einzubinden'
  ],
  ARRAY[
    'Den AI-Kontext nicht pflegen (zu viele irrelevante Dateien)',
    'Keine .cursorrules oder Projekt-Dokumentation erstellen',
    'Große Dateien komplett neu generieren lassen statt gezielt zu editieren',
    'Blind Code akzeptieren ohne zu reviewen'
  ],
  '#7c3aed',
  3,
  true
),

-- CLAUDE CODE
(
  'claude-code',
  'Claude Code',
  'Anthropic Terminal Agent',
  'Claude Code ist ein Terminal-basierter AI-Agent von Anthropic, der komplexe Entwicklungsaufgaben selbstständig ausführen kann.',
  'https://claude.ai',
  'https://docs.anthropic.com',
  3, 5, 5, 5, 2,
  ARRAY['Agentic Workflows', 'Komplexe Aufgaben autonom', 'Beste Code-Qualität', 'Multi-File Support', 'Git-Integration', 'Shell-Zugriff'],
  ARRAY['Terminal-basiert', 'Erfordert Erfahrung', 'API-Kosten', 'Keine GUI'],
  ARRAY['Komplexe Refactoring', 'Full-Stack Development', 'Automatisierung', 'Professional Projects'],
  ARRAY['Absolute Anfänger', 'Quick Prototypes', 'Visual Design'],
  'usage-based',
  'API-Kosten nach Verbrauch, ca. $3-20/Tag bei aktivem Coding',
  ARRAY['Python', 'Node.js', 'Any Language', 'Shell'],
  ARRAY['Git', 'GitHub', 'Docker', 'Any CLI tool'],
  ARRAY[
    'Erstelle eine ausführliche CLAUDE.md mit Projekt-Kontext',
    'Nutze klare, strukturierte Prompts mit Beispielen',
    'Lass Claude erst planen, dann implementieren',
    'Nutze Git-Commits zwischen Änderungen',
    'Gib Claude Zugriff auf die Dokumentation der verwendeten Libraries'
  ],
  ARRAY[
    'Keine Projekt-Dokumentation bereitstellen',
    'Zu vage Anweisungen geben',
    'Nicht committen zwischen Änderungen',
    'Claude nicht die Codebase indexieren lassen'
  ],
  '#d97706',
  4,
  true
),

-- V0
(
  'v0',
  'v0.dev',
  'Generate UI with AI',
  'v0 von Vercel generiert React-Komponenten und UI-Elemente. Perfekt für einzelne Komponenten, weniger für ganze Apps.',
  'https://v0.dev',
  'https://v0.dev/docs',
  5, 1, 1, 2, 5,
  ARRAY['Hervorragende UI-Komponenten', 'Shadcn/ui Integration', 'Copy-Paste Ready', 'Schnelle Iteration'],
  ARRAY['Nur Komponenten, keine Apps', 'Kein Backend', 'Keine Datenbank', 'Begrenzte Komplexität'],
  ARRAY['UI-Komponenten', 'Design-System aufbauen', 'Einzelne Features', 'Inspiration'],
  ARRAY['Komplette Apps', 'Backend-Logik', 'Datenbank-Integration'],
  'freemium',
  'Großzügiges Free Tier, Pro für mehr Generierungen',
  ARRAY['React', 'Tailwind', 'shadcn/ui', 'Radix'],
  ARRAY['Vercel', 'GitHub'],
  ARRAY[
    'Nutze v0 um einzelne Komponenten zu generieren und kopiere sie in dein Projekt',
    'Kombiniere v0-Komponenten mit deinem eigenen Backend',
    'Nutze v0 für Design-Inspiration auch wenn du den Code nicht 1:1 übernimmst',
    'Generiere mehrere Varianten und wähle die beste'
  ],
  ARRAY[
    'Erwarten dass v0 komplette Apps generiert',
    'Die Komponenten ohne Anpassung verwenden',
    'Kein eigenes Styling/Branding anwenden'
  ],
  '#000000',
  5,
  false
),

-- REPLIT
(
  'replit',
  'Replit',
  'Build software collaboratively',
  'Replit ist eine Browser-basierte Entwicklungsumgebung mit AI-Unterstützung. Gut für Anfänger und kollaboratives Arbeiten.',
  'https://replit.com',
  'https://docs.replit.com',
  4, 4, 3, 5, 4,
  ARRAY['Browser-basiert', 'Instant Deployment', 'Kollaboration', 'Viele Sprachen', 'Hosting inklusive'],
  ARRAY['Manchmal langsam', 'Begrenzte Ressourcen im Free Tier', 'Vendor Lock-in', 'Weniger Kontrolle'],
  ARRAY['Lernen und Experimentieren', 'Kleine bis mittlere Projekte', 'Kollaboration', 'Quick Deployments'],
  ARRAY['Große Projekte', 'High-Performance Apps', 'Enterprise'],
  'freemium',
  'Free Tier verfügbar, Hacker $7/Monat, Pro $20/Monat',
  ARRAY['Python', 'Node.js', 'Many more'],
  ARRAY['GitHub', 'Custom Domains', 'Databases'],
  ARRAY[
    'Nutze Replit zum schnellen Testen von Ideen',
    'Die Always-On Funktion für kleine Services',
    'Exportiere wichtige Projekte regelmäßig',
    'Nutze Replit Deployments für einfaches Hosting'
  ],
  ARRAY[
    'Production-kritische Apps nur auf Replit hosten',
    'Nicht regelmäßig Code sichern',
    'Auf das Free Tier für wichtige Projekte verlassen'
  ],
  '#f26207',
  6,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  rating_ui = EXCLUDED.rating_ui,
  rating_backend = EXCLUDED.rating_backend,
  rating_database = EXCLUDED.rating_database,
  rating_deployment = EXCLUDED.rating_deployment,
  rating_learning_curve = EXCLUDED.rating_learning_curve,
  strengths = EXCLUDED.strengths,
  weaknesses = EXCLUDED.weaknesses,
  best_for = EXCLUDED.best_for,
  not_for = EXCLUDED.not_for,
  pricing_model = EXCLUDED.pricing_model,
  pricing_details = EXCLUDED.pricing_details,
  tech_stack = EXCLUDED.tech_stack,
  integrations = EXCLUDED.integrations,
  pro_tips = EXCLUDED.pro_tips,
  common_mistakes = EXCLUDED.common_mistakes,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();

-- ══════════════════════════════════════════════════════════════
-- SEED DATA: CHECKLISTS (Idempotent with ON CONFLICT)
-- ══════════════════════════════════════════════════════════════

-- MVP Readiness Checklist
INSERT INTO toolkit_checklists (slug, title, description, icon, difficulty, estimated_time, is_featured, sort_order)
VALUES (
  'mvp-readiness',
  'MVP-Readiness Checklist',
  'Ist dein Produkt wirklich fertig für den Launch? Diese Checklist prüft alle kritischen Bereiche.',
  'CheckCircle',
  'beginner',
  '30-60 min',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Get the checklist ID and insert items (delete existing items first for idempotency)
DO $$
DECLARE
  checklist_id UUID;
BEGIN
  SELECT id INTO checklist_id FROM toolkit_checklists WHERE slug = 'mvp-readiness';

  -- Delete existing items for this checklist to avoid duplicates
  DELETE FROM toolkit_checklist_items WHERE checklist_id = checklist_id;

  -- Insert items
  INSERT INTO toolkit_checklist_items (checklist_id, title, description, help_text, section, sort_order, is_critical) VALUES

  -- Section: Backend & Database
  (checklist_id, 'Datenbank ist NICHT nur lokal/Demo', 'Daten werden in einer echten Datenbank gespeichert (z.B. Supabase, PlanetScale)', 'Viele AI-Tools generieren nur lokale State-Speicherung. Prüfe ob du eine echte Datenbank hast.', 'Backend & Database', 1, true),
  (checklist_id, 'Daten bleiben nach Refresh erhalten', 'Wenn du die Seite neu lädst, sind alle Daten noch da', 'Teste: Erstelle Daten, lade die Seite neu, prüfe ob alles noch da ist.', 'Backend & Database', 2, true),
  (checklist_id, 'Daten bleiben nach Logout/Login erhalten', 'Nach dem Ausloggen und wieder Einloggen sind alle User-Daten noch da', 'Wichtig für Multi-Session Support.', 'Backend & Database', 3, true),
  (checklist_id, 'Migrations sind vorhanden', 'Datenbank-Schema ist in Migration-Dateien dokumentiert', 'Ohne Migrations kannst du Änderungen nicht nachvollziehen.', 'Backend & Database', 4, false),
  (checklist_id, 'RLS (Row Level Security) ist aktiv', 'User können nur ihre eigenen Daten sehen', 'Bei Supabase: Prüfe dass RLS auf allen Tabellen aktiviert ist.', 'Backend & Database', 5, true),

  -- Section: Authentication
  (checklist_id, 'Login funktioniert', 'User können sich mit Email/Passwort anmelden', 'Teste den kompletten Flow: Registrierung, Login, Logout.', 'Authentifizierung', 6, true),
  (checklist_id, 'Session bleibt nach Browser-Refresh', 'Nach dem Neuladen der Seite ist der User noch eingeloggt', 'Prüfe dass Session-Tokens korrekt gespeichert werden.', 'Authentifizierung', 7, true),
  (checklist_id, 'Passwort-Reset funktioniert', 'User können ihr Passwort zurücksetzen', 'Teste den kompletten Reset-Flow inkl. Email.', 'Authentifizierung', 8, false),
  (checklist_id, 'Geschützte Routen sind geschützt', 'Nicht eingeloggte User werden zu /login redirected', 'Teste: Öffne eine geschützte URL ohne Login.', 'Authentifizierung', 9, true),

  -- Section: API & Security
  (checklist_id, 'Keine API-Keys im Frontend-Code', 'Sensible Keys sind nur in Environment Variables auf dem Server', 'Suche in deinem Code nach API_KEY, SECRET, etc. Diese gehören in .env', 'API & Security', 10, true),
  (checklist_id, 'Environment Variables sind konfiguriert', 'Alle nötigen Env-Vars sind auf dem Server gesetzt', 'Bei Vercel: Settings > Environment Variables prüfen.', 'API & Security', 11, true),
  (checklist_id, 'API-Endpoints sind geschützt', 'Backend-Endpoints prüfen ob der User authentifiziert ist', 'Teste: Rufe Endpoints ohne Auth-Token auf - sie sollten 401 zurückgeben.', 'API & Security', 12, true),
  (checklist_id, 'CORS ist korrekt konfiguriert', 'Nur deine Domain kann API-Requests machen', 'Bei Supabase Edge Functions: CORS-Headers setzen.', 'API & Security', 13, false),

  -- Section: Deployment
  (checklist_id, 'App läuft auf Production URL', 'Die App ist unter einer echten URL erreichbar (nicht localhost)', 'Deploy zu Vercel, Netlify, oder ähnlichem.', 'Deployment', 14, true),
  (checklist_id, 'HTTPS ist aktiv', 'Die URL beginnt mit https://', 'Moderne Hosting-Provider machen das automatisch.', 'Deployment', 15, true),
  (checklist_id, 'Build läuft ohne Errors', 'npm run build oder ähnlich läuft fehlerfrei durch', 'Behebe alle Build-Errors vor dem Launch.', 'Deployment', 16, true),
  (checklist_id, 'Keine Console Errors in Production', 'Die Browser-Console zeigt keine roten Fehler', 'Öffne DevTools > Console und prüfe auf Errors.', 'Deployment', 17, false),

  -- Section: UX Basics
  (checklist_id, 'Loading States sind vorhanden', 'User sehen Ladeanimationen während Daten geladen werden', 'Leere Screens ohne Feedback sind verwirrend.', 'UX Basics', 18, false),
  (checklist_id, 'Error States sind vorhanden', 'Fehler werden dem User sinnvoll angezeigt', 'User sollten verstehen was schief ging.', 'UX Basics', 19, false),
  (checklist_id, 'Empty States sind vorhanden', 'Leere Listen zeigen hilfreiche Nachrichten', '"Noch keine Einträge. Erstelle deinen ersten!"', 'UX Basics', 20, false),
  (checklist_id, 'Responsive Design', 'Die App sieht auf Mobile und Desktop gut aus', 'Teste auf verschiedenen Bildschirmgrößen.', 'UX Basics', 21, false),

  -- Section: Legal (DE)
  (checklist_id, 'Impressum vorhanden', 'Rechtlich erforderlich für DE', 'Pflichtangaben: Name, Adresse, Kontakt, ggf. HRB.', 'Legal (DE)', 22, true),
  (checklist_id, 'Datenschutzerklärung vorhanden', 'DSGVO-konforme Datenschutzseite', 'Beschreibe welche Daten du sammelst und warum.', 'Legal (DE)', 23, true);

END $$;

-- Go-Live Checklist
INSERT INTO toolkit_checklists (slug, title, description, icon, difficulty, estimated_time, is_featured, sort_order)
VALUES (
  'go-live',
  'Go-Live Checklist',
  'Alles was du vor dem Launch prüfen solltest.',
  'Rocket',
  'intermediate',
  '1-2 Stunden',
  true,
  2
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ══════════════════════════════════════════════════════════════
-- SEED DATA: PITFALLS (Idempotent - delete and reinsert)
-- ══════════════════════════════════════════════════════════════

-- Delete existing pitfalls and reinsert (no unique constraint on title)
DELETE FROM toolkit_pitfalls;

INSERT INTO toolkit_pitfalls (category, title, description, why_bad, solution, affected_tools, severity, icon) VALUES

-- Frontend Fehler
('frontend', 'API-Keys im Frontend-Code',
 'API-Keys direkt im React/Frontend-Code hardcoden',
 'Jeder kann deine API-Keys in den DevTools sehen und missbrauchen. Das kann sehr teuer werden!',
 'Nutze Backend-Funktionen (Edge Functions, API Routes) um API-Calls zu machen. Keys gehören in Server-seitige Environment Variables.',
 ARRAY['lovable', 'bolt', 'v0'],
 'critical',
 'Key'),

('frontend', 'Nur Client-Side State',
 'Daten werden nur in React State gespeichert, keine echte Datenbank',
 'Alle Daten gehen verloren wenn der User die Seite schließt oder refresht.',
 'Verbinde eine echte Datenbank (Supabase, Firebase, etc.) und speichere Daten dort.',
 ARRAY['lovable', 'v0'],
 'critical',
 'Database'),

('frontend', 'Keine Error Boundaries',
 'Fehler in einer Komponente crashen die ganze App',
 'Ein kleiner Bug kann die komplette App unbenutzbar machen.',
 'Implementiere React Error Boundaries um Fehler abzufangen und dem User eine sinnvolle Meldung zu zeigen.',
 ARRAY['lovable', 'bolt'],
 'warning',
 'AlertTriangle'),

-- Backend Fehler
('backend', 'Keine Input Validierung',
 'User-Input wird nicht validiert bevor er verarbeitet wird',
 'Ermöglicht SQL Injection, XSS und andere Angriffe. Kann deine komplette Datenbank kompromittieren.',
 'Validiere JEDEN User-Input. Nutze Libraries wie Zod oder Yup. Sanitize HTML-Input.',
 NULL,
 'critical',
 'Shield'),

('backend', 'Fehlende Rate Limiting',
 'API-Endpoints haben keine Begrenzung für Anfragen',
 'Jemand kann deine API spammen und hohe Kosten oder Ausfälle verursachen.',
 'Implementiere Rate Limiting auf kritischen Endpoints. Bei Supabase: Edge Function mit Redis/Upstash.',
 NULL,
 'warning',
 'Gauge'),

-- Database Fehler
('database', 'Keine Row Level Security (RLS)',
 'Supabase-Tabellen ohne RLS-Policies',
 'JEDER kann auf ALLE Daten zugreifen! Massive Sicherheitslücke.',
 'Aktiviere RLS auf allen Tabellen und erstelle Policies die nur Zugriff auf eigene Daten erlauben.',
 ARRAY['lovable', 'bolt'],
 'critical',
 'Lock'),

('database', 'Keine Migrations',
 'Datenbank-Schema wird manuell in der UI geändert ohne Dokumentation',
 'Du kannst Änderungen nicht nachvollziehen oder rückgängig machen. Deployment auf andere Umgebungen ist unmöglich.',
 'Erstelle für jede Schema-Änderung eine Migration-Datei. Nutze Supabase CLI oder ähnliche Tools.',
 NULL,
 'warning',
 'FileText'),

('database', 'Keine Backups',
 'Keine automatischen Datenbank-Backups konfiguriert',
 'Datenverlust bei Problemen kann nicht wiederhergestellt werden.',
 'Aktiviere automatische Backups in deinem Datenbank-Provider. Bei Supabase: ist automatisch aktiv auf Pro-Plan.',
 NULL,
 'warning',
 'HardDrive'),

-- Auth Fehler
('auth', 'Selbstgebaute Authentifizierung',
 'Eigene Login-Logik statt etablierter Auth-Provider',
 'Auth ist komplex und fehleranfällig. Selbstgebaut enthält fast immer Sicherheitslücken.',
 'Nutze etablierte Auth-Provider: Supabase Auth, Clerk, Auth0, NextAuth. Die haben das schon gelöst.',
 NULL,
 'critical',
 'UserX'),

('auth', 'Tokens im localStorage ohne Sicherheit',
 'JWT-Tokens werden ohne weitere Sicherheitsmaßnahmen in localStorage gespeichert',
 'XSS-Angriffe können die Tokens stehlen und Sessions übernehmen.',
 'Nutze HttpOnly Cookies oder den eingebauten Session-Management deines Auth-Providers.',
 NULL,
 'warning',
 'Cookie'),

-- Deployment Fehler
('deployment', 'Keine Environment Variables trennen',
 'Gleiche API-Keys für Development und Production',
 'Test-Daten landen in Production, Production-Keys werden versehentlich geleakt.',
 'Erstelle separate Environments: Development, Staging, Production. Jedes mit eigenen Keys.',
 NULL,
 'warning',
 'Boxes'),

('deployment', 'Keine Error Monitoring',
 'Keine Tools um Errors in Production zu tracken',
 'Du bekommst nicht mit wenn etwas kaputt geht. User churnen ohne dass du weißt warum.',
 'Integriere Sentry, LogRocket oder ähnliche Tools um Errors zu tracken.',
 NULL,
 'info',
 'Activity'),

-- Security Fehler
('security', 'CORS: Allow All Origins',
 'CORS-Header erlauben Requests von überall (Access-Control-Allow-Origin: *)',
 'Jede Website kann Requests an deine API machen.',
 'Beschränke CORS auf deine eigenen Domains. Bei Edge Functions explizit nur erlaubte Origins listen.',
 NULL,
 'warning',
 'Globe'),

('security', 'Sensible Daten in Error Messages',
 'Stack Traces oder interne Infos werden dem User angezeigt',
 'Angreifer können Informationen über deine Infrastruktur sammeln.',
 'Zeige dem User nur generische Fehlermeldungen. Logge Details serverseitig.',
 NULL,
 'warning',
 'AlertOctagon');

-- ══════════════════════════════════════════════════════════════
-- SEED DATA: PROMPTS (Idempotent with ON CONFLICT)
-- ══════════════════════════════════════════════════════════════

INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES

-- Landing Page Prompt
(
  'landing-page',
  'Landing Page erstellen',
  'Generiert eine professionelle Landing Page für dein Startup',
  'Du willst schnell eine Landing Page für dein Produkt erstellen',
  E'Erstelle eine moderne Landing Page für folgendes Startup:

**Produktname:** {{product_name}}
**Tagline:** {{tagline}}
**Beschreibung:** {{description}}
**Zielgruppe:** {{target_audience}}
**Call to Action:** {{cta}}

Anforderungen:
- Hero Section mit Headline und CTA
- Features/Benefits Section (3-4 Punkte)
- Social Proof / Testimonials Placeholder
- Pricing Section (falls gewünscht: {{pricing}})
- FAQ Section
- Footer mit Links

Design:
- Modernes, cleanes Design
- Tailwind CSS
- Responsive (Mobile-First)
- Farbschema: {{colors}}
- Smooth Scroll zu Sektionen

Technisch:
- React mit TypeScript
- Tailwind CSS
- Framer Motion für Animationen
- Lucide Icons',
  '[
    {"name": "product_name", "label": "Produktname", "type": "text", "placeholder": "LaunchOS", "required": true},
    {"name": "tagline", "label": "Tagline", "type": "text", "placeholder": "Von der Idee zum Investor-Ready Startup", "required": true},
    {"name": "description", "label": "Kurzbeschreibung", "type": "textarea", "placeholder": "Beschreibe dein Produkt in 2-3 Sätzen"},
    {"name": "target_audience", "label": "Zielgruppe", "type": "text", "placeholder": "Tech-Gründer, Startups"},
    {"name": "cta", "label": "Call to Action", "type": "text", "placeholder": "Jetzt starten"},
    {"name": "pricing", "label": "Preismodell", "type": "text", "placeholder": "Free / Pro $29/mo"},
    {"name": "colors", "label": "Farben", "type": "text", "placeholder": "Purple/Pink Gradient"}
  ]'::jsonb,
  'Eine vollständige React-Komponente mit allen Sections, responsive und animiert.',
  'lovable',
  ARRAY['landing-page', 'marketing', 'ui'],
  true,
  1
),

-- Auth System Prompt
(
  'auth-system',
  'Authentication System aufsetzen',
  'Vollständiges Auth-System mit Supabase',
  'Du brauchst Login, Logout, Registrierung und geschützte Routen',
  E'Erstelle ein vollständiges Authentication System mit Supabase:

**Projekt:** {{project_name}}
**Benötigte Features:** {{auth_features}}

Implementiere:

1. **Auth Context/Provider**
   - User State Management
   - Session Persistence
   - Auto-Refresh Token

2. **Auth Pages**
   - Login (Email/Password)
   - Registrierung
   - Passwort vergessen
   - Optional: OAuth (Google, GitHub)

3. **Protected Routes**
   - HOC oder Wrapper für geschützte Seiten
   - Redirect zu /login wenn nicht authentifiziert

4. **Auth Hooks**
   - useAuth() für User-Daten
   - useSession() für Session-Status

5. **UI-Komponenten**
   - Login-Formular mit Validation
   - Registrierungs-Formular
   - Error Handling
   - Loading States

Technische Anforderungen:
- Supabase Auth (@supabase/supabase-js)
- React Context für State
- React Router für Navigation
- Zod für Form Validation
- Tailwind CSS für Styling',
  '[
    {"name": "project_name", "label": "Projektname", "type": "text", "placeholder": "Mein Startup"},
    {"name": "auth_features", "label": "Features", "type": "select", "options": ["Nur Email/Password", "Mit OAuth (Google)", "Mit OAuth (Google + GitHub)", "Komplett mit 2FA"]}
  ]'::jsonb,
  NULL,
  'any',
  ARRAY['auth', 'supabase', 'security'],
  true,
  2
),

-- Database Schema Prompt
(
  'database-schema',
  'Datenbank-Schema designen',
  'Erstellt ein durchdachtes Supabase-Schema für deinen Use Case',
  'Du brauchst ein Datenbank-Schema für dein Projekt',
  E'Erstelle ein vollständiges Supabase Datenbank-Schema für folgendes Projekt:

**Projektbeschreibung:** {{project_description}}
**Haupt-Entities:** {{main_entities}}
**Spezielle Anforderungen:** {{special_requirements}}

Erstelle:

1. **SQL-Migration**
   - Alle Tabellen mit korrekten Datentypen
   - Foreign Keys und Constraints
   - Indexes für Performance
   - Timestamps (created_at, updated_at)

2. **Row Level Security (RLS)**
   - RLS aktivieren auf allen Tabellen
   - Policies für CRUD-Operationen
   - User können nur eigene Daten sehen

3. **Triggers**
   - Auto-Update für updated_at
   - Weitere Business-Logik falls nötig

4. **Typen (TypeScript)**
   - Interface-Definitionen für alle Tabellen
   - Passend zum Supabase-Schema

Wichtig:
- Nutze UUIDs als Primary Keys
- Implementiere Soft Deletes wo sinnvoll
- Dokumentiere komplexe Relationen
- Folge Naming Conventions (snake_case für SQL)',
  '[
    {"name": "project_description", "label": "Was macht dein Produkt?", "type": "textarea", "placeholder": "Ein CRM für Startup-Gründer..."},
    {"name": "main_entities", "label": "Haupt-Entities", "type": "text", "placeholder": "Users, Companies, Contacts, Activities"},
    {"name": "special_requirements", "label": "Besondere Anforderungen", "type": "textarea", "placeholder": "Multi-Tenant, Audit Log, etc."}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['database', 'supabase', 'schema'],
  true,
  3
),

-- API Endpoint Prompt
(
  'api-endpoint',
  'API Endpoint erstellen',
  'Supabase Edge Function für Backend-Logik',
  'Du brauchst einen Backend-Endpoint für komplexe Logik',
  E'Erstelle eine Supabase Edge Function für folgenden Zweck:

**Endpoint-Name:** {{endpoint_name}}
**Beschreibung:** {{description}}
**HTTP-Methode:** {{method}}
**Input-Parameter:** {{input_params}}
**Expected Output:** {{output}}

Implementiere:

1. **Edge Function** (Deno/TypeScript)
   - Korrekte CORS-Header
   - Input Validation
   - Error Handling
   - Authentifizierung (falls nötig: {{auth_required}})

2. **Response Format**
   - Konsistente JSON-Struktur
   - Proper HTTP Status Codes
   - Error Messages

3. **Integration**
   - Frontend-Code zum Aufrufen
   - TypeScript Types für Request/Response

Beispiel-Struktur:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "@supabase/supabase-js"

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Implementation
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
```',
  '[
    {"name": "endpoint_name", "label": "Endpoint Name", "type": "text", "placeholder": "send-email"},
    {"name": "description", "label": "Was soll der Endpoint tun?", "type": "textarea"},
    {"name": "method", "label": "HTTP Methode", "type": "select", "options": ["POST", "GET", "PUT", "DELETE"]},
    {"name": "input_params", "label": "Input Parameter", "type": "textarea", "placeholder": "email: string, subject: string, body: string"},
    {"name": "output", "label": "Expected Output", "type": "textarea", "placeholder": "{ success: boolean, messageId: string }"},
    {"name": "auth_required", "label": "Auth erforderlich?", "type": "select", "options": ["Ja", "Nein"]}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['api', 'backend', 'supabase', 'edge-functions'],
  true,
  4
),

-- Bugfix Prompt
(
  'debug-error',
  'Fehler debuggen',
  'Strukturierter Prompt um Fehler effektiv zu beheben',
  'Du hast einen Fehler und kommst nicht weiter',
  E'Ich habe folgenden Fehler und brauche Hilfe beim Debuggen:

**Error Message:**
```
{{error_message}}
```

**Kontext:**
- Was ich machen wollte: {{what_i_tried}}
- Wann tritt der Fehler auf: {{when_error_occurs}}
- Relevanter Code:
```{{code_language}}
{{relevant_code}}
```

**Was ich bereits versucht habe:**
{{already_tried}}

**Environment:**
- Framework: {{framework}}
- Database: {{database}}
- Hosting: {{hosting}}

Bitte:
1. Erkläre was der Fehler bedeutet
2. Identifiziere die wahrscheinliche Ursache
3. Zeige mir den Fix mit Code
4. Erkläre wie ich ähnliche Fehler in Zukunft vermeiden kann',
  '[
    {"name": "error_message", "label": "Fehlermeldung (vollständig)", "type": "textarea", "required": true},
    {"name": "what_i_tried", "label": "Was wolltest du machen?", "type": "textarea"},
    {"name": "when_error_occurs", "label": "Wann tritt der Fehler auf?", "type": "text", "placeholder": "Beim Klicken auf Submit"},
    {"name": "code_language", "label": "Sprache", "type": "select", "options": ["typescript", "javascript", "sql", "python"]},
    {"name": "relevant_code", "label": "Relevanter Code", "type": "textarea"},
    {"name": "already_tried", "label": "Was hast du bereits versucht?", "type": "textarea"},
    {"name": "framework", "label": "Framework", "type": "text", "placeholder": "React, Next.js, etc."},
    {"name": "database", "label": "Datenbank", "type": "text", "placeholder": "Supabase"},
    {"name": "hosting", "label": "Hosting", "type": "text", "placeholder": "Vercel"}
  ]'::jsonb,
  NULL,
  'any',
  ARRAY['debugging', 'errors', 'troubleshooting'],
  true,
  5
),

-- CRUD Feature Prompt
(
  'crud-feature',
  'CRUD Feature implementieren',
  'Vollständiges Feature mit Create, Read, Update, Delete',
  'Du brauchst ein komplett neues Feature mit Datenbank-Anbindung',
  E'Implementiere ein vollständiges CRUD-Feature:

**Feature-Name:** {{feature_name}}
**Beschreibung:** {{description}}
**Entity/Tabelle:** {{entity_name}}
**Felder:** {{fields}}

Erstelle:

1. **Datenbank**
   - SQL-Migration für die Tabelle
   - RLS-Policies
   - TypeScript Types

2. **Backend/Hook**
   - Custom Hook: use{{entity_name}}s()
   - Alle CRUD-Operationen
   - Loading & Error States
   - Optimistic Updates

3. **UI-Komponenten**
   - Liste mit Pagination
   - Create Modal/Form
   - Edit Modal/Form
   - Delete Confirmation
   - Empty State
   - Loading Skeleton

4. **Seite**
   - Haupt-Page mit Liste
   - Filter & Suche
   - Sortierung

Design:
- LaunchOS Branding (Purple/Pink Gradient)
- Tailwind CSS
- Framer Motion Animationen
- Responsive',
  '[
    {"name": "feature_name", "label": "Feature Name", "type": "text", "placeholder": "Investor Contacts"},
    {"name": "description", "label": "Beschreibung", "type": "textarea", "placeholder": "Verwaltung von Investoren-Kontakten"},
    {"name": "entity_name", "label": "Entity Name (Singular)", "type": "text", "placeholder": "Contact"},
    {"name": "fields", "label": "Felder (eines pro Zeile)", "type": "textarea", "placeholder": "name: string\\nemail: string\\ncompany: string\\nstatus: enum"}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['crud', 'feature', 'full-stack'],
  true,
  6
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  example_output = EXCLUDED.example_output,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ══════════════════════════════════════════════════════════════
-- SEED DATA: GUIDES (Idempotent with ON CONFLICT)
-- ══════════════════════════════════════════════════════════════

INSERT INTO toolkit_guides (
  category_id, slug, title, subtitle, description, content_md,
  difficulty, estimated_time, tools, tags, is_featured, author_name
)
SELECT
  c.id,
  'was-braucht-ein-echtes-produkt',
  'Was braucht ein "echtes" Produkt?',
  'Die Wahrheit über AI-generierte Apps und was wirklich fehlt',
  'Lovable, Bolt & Co. generieren schöne UIs - aber was braucht ein funktionierendes Produkt wirklich?',
  E'# Was braucht ein "echtes" Produkt?

Du hast mit Lovable oder Bolt eine App generiert und sie sieht fantastisch aus. Glückwunsch!

Aber halt - bevor du sie als "fertig" bezeichnest, lass uns ehrlich sein: **Was du hast ist wahrscheinlich nur ein UI-Mockup, kein funktionierendes Produkt.**

## Das Problem mit AI-generierten Apps

Die meisten AI-Coding-Tools sind hervorragend darin, **schöne Interfaces** zu generieren. Aber ein echtes Produkt braucht viel mehr:

### Was AI-Tools gut können:
- Schnelle UI-Generierung
- Responsive Designs
- Moderne Komponenten
- Basis-Interaktionen

### Was oft fehlt:
- Echte Datenbank-Anbindung
- Funktionierende Authentifizierung
- Backend-Logik
- Security
- Deployment-fähiger Code

## Die 7 Säulen eines funktionierenden Produkts

### 1. Persistente Datenspeicherung

**Das Problem:** Deine App speichert Daten nur im Browser-Speicher (localStorage oder React State). Wenn der User die Seite schließt - weg sind die Daten.

**Die Lösung:** Eine echte Datenbank wie Supabase, Firebase oder PlanetScale.

```typescript
// So nicht - Daten gehen verloren
const [items, setItems] = useState([]);

// So ja - Daten werden in der DB gespeichert
const { data: items } = await supabase.from("items").select("*");
```

### 2. Authentifizierung

**Das Problem:** Entweder keine Auth, oder eine "Fake-Auth" die nur UI ist.

**Die Lösung:** Ein echter Auth-Provider (Supabase Auth, Clerk, Auth0).

Checklist für echte Auth:
- User können sich registrieren
- Login funktioniert
- Session bleibt nach Refresh
- Passwort-Reset möglich
- Geschützte Routen sind wirklich geschützt

### 3. Row Level Security (RLS)

**Das Problem:** Ohne RLS kann jeder User die Daten aller User sehen.

**Die Lösung:** RLS-Policies in Supabase.

```sql
-- User können nur ihre eigenen Daten sehen
CREATE POLICY "Users can view own data"
ON items FOR SELECT
USING (auth.uid() = user_id);
```

### 4. API-Security

**Das Problem:** API-Keys im Frontend-Code. JEDER kann sie sehen!

**Die Lösung:**
- Sensible Operationen in Backend-Funktionen (Edge Functions)
- API-Keys nur in Environment Variables auf dem Server
- Niemals im Git-Repo

### 5. Error Handling

**Das Problem:** Irgendwas geht schief → weiße Seite oder kryptische Fehler.

**Die Lösung:**
- Error Boundaries in React
- User-freundliche Fehlermeldungen
- Graceful Degradation

### 6. Migrations & Schema-Management

**Das Problem:** Datenbank-Schema nur in der Cloud-UI, keine Dokumentation.

**Die Lösung:** Migration-Dateien für jede Änderung.

```bash
npx supabase migration new add_users_table
```

### 7. Deployment & DevOps

**Das Problem:** "Es läuft auf localhost" ist kein Deployment.

**Die Lösung:**
- Echtes Hosting (Vercel, Netlify, etc.)
- CI/CD Pipeline
- Environment Variables korrekt konfiguriert
- HTTPS

## Wie du von "schönem UI" zu "echtem Produkt" kommst

### Step 1: Datenbank aufsetzen
1. Supabase-Projekt erstellen
2. Schema designen
3. Migrations schreiben
4. RLS aktivieren

### Step 2: Auth integrieren
1. Supabase Auth konfigurieren
2. Auth-Provider in der App
3. Geschützte Routen
4. Login/Logout UI

### Step 3: Frontend mit Backend verbinden
1. Supabase Client installieren
2. Queries statt localStorage
3. Realtime für Live-Updates

### Step 4: Security härten
1. Keine API-Keys im Frontend
2. Edge Functions für sensible Logik
3. Input Validation

### Step 5: Deploy
1. Zu Vercel/Netlify deployen
2. Environment Variables setzen
3. Custom Domain (optional)

## Fazit

**AI-Tools sind fantastisch für den Start.** Aber sie ersetzen nicht das Verständnis dafür, was ein funktionierendes Produkt ausmacht.

Nutze die [MVP-Readiness Checklist](/toolkit/checklists/mvp-readiness) um zu prüfen, ob dein Produkt wirklich ready ist.

---

*Dieser Guide basiert auf 50+ Tagen praktischer Erfahrung mit AI-Coding-Tools.*',
  'beginner',
  '20 min',
  ARRAY['lovable', 'bolt', 'cursor'],
  ARRAY['basics', 'architecture', 'must-read'],
  true,
  'LaunchOS Team'
FROM toolkit_categories c WHERE c.slug = 'getting-started'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content_md = EXCLUDED.content_md,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  tools = EXCLUDED.tools,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  author_name = EXCLUDED.author_name,
  updated_at = NOW();
