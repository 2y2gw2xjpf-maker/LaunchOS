-- ═══════════════════════════════════════════════════════════════
-- LAUNCHOS BUILDER'S TOOLKIT - ADDITIONAL CONTENT
-- This migration adds:
-- - 5 new Guides (Supabase, Cursor, Deployment, API Keys, Claude Code)
-- - Go-Live Checklist Items (20 items)
-- - 6 new Prompts
-- - Tool Logo URLs
--
-- IDEMPOTENT: Uses ON CONFLICT DO UPDATE for safe re-runs
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. NEUE GUIDES
-- ═══════════════════════════════════════════════════════════════

-- Guide: Supabase Setup Guide
INSERT INTO toolkit_guides (
  category_id, slug, title, subtitle, description, content_md,
  difficulty, estimated_time, tools, tags, is_featured, author_name
)
SELECT
  c.id,
  'supabase-setup-guide',
  'Supabase Setup: Von 0 zur funktionierenden Datenbank',
  'Schritt-für-Schritt Anleitung für dein erstes Supabase-Projekt',
  'Lerne wie du Supabase richtig aufsetzt, Tabellen erstellst, RLS konfigurierst und deine App verbindest.',
  E'# Supabase Setup: Von 0 zur funktionierenden Datenbank

Supabase ist die beste Wahl für Startups die schnell eine skalierbare Backend-Infrastruktur brauchen. In diesem Guide lernst du alles von der Einrichtung bis zur Production.

## Warum Supabase?

- ✅ PostgreSQL Datenbank (battle-tested)
- ✅ Authentifizierung out-of-the-box
- ✅ Row Level Security
- ✅ Realtime Subscriptions
- ✅ Edge Functions (Serverless)
- ✅ Storage für Dateien
- ✅ Großzügiges Free Tier

## Step 1: Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke "Start your project"
3. Verbinde mit GitHub
4. Wähle eine Region (Frankfurt für DE)
5. Setze ein sicheres Datenbank-Passwort

> ⚠️ **Wichtig:** Speichere das Datenbank-Passwort sicher ab!

## Step 2: Projekt-Credentials holen

Nach der Erstellung findest du unter **Settings > API**:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Diese kommen in deine `.env` Datei.

## Step 3: Supabase Client installieren

```bash
npm install @supabase/supabase-js
```

## Step 4: Client initialisieren

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Step 5: Erste Tabelle erstellen

### Option A: SQL Editor (empfohlen)

```sql
-- Erstelle eine Tabelle für Projekte
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT ''draft'' CHECK (status IN (''draft'', ''active'', ''completed'')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren (WICHTIG!)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur eigene Projekte sehen
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User können eigene Projekte erstellen
CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: User können eigene Projekte bearbeiten
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: User können eigene Projekte löschen
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Index für Performance
CREATE INDEX idx_projects_user ON projects(user_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Option B: Table Editor (für Anfänger)

1. Gehe zu **Table Editor**
2. Klicke **New Table**
3. Füge Spalten hinzu
4. ⚠️ Vergiss nicht RLS zu aktivieren!

## Step 6: Daten abfragen

```typescript
// Alle Projekte des Users laden
const { data: projects, error } = await supabase
  .from("projects")
  .select("*")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Error:", error.message);
  return;
}

console.log("Projekte:", projects);
```

## Step 7: Daten einfügen

```typescript
const { data, error } = await supabase
  .from("projects")
  .insert({
    user_id: user.id,
    name: "Mein erstes Projekt",
    description: "Das ist ein Test",
  })
  .select()
  .single();
```

## Step 8: Daten aktualisieren

```typescript
const { error } = await supabase
  .from("projects")
  .update({ status: "active" })
  .eq("id", projectId);
```

## Step 9: Daten löschen

```typescript
const { error } = await supabase
  .from("projects")
  .delete()
  .eq("id", projectId);
```

## Best Practices

### 1. Immer RLS aktivieren
```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

### 2. Migrations nutzen
```bash
# Supabase CLI installieren
npm install -g supabase

# Projekt initialisieren
supabase init

# Migration erstellen
supabase migration new create_projects_table

# Migration ausführen
supabase db push
```

### 3. TypeScript Types generieren
```bash
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

### 4. Fehler immer behandeln
```typescript
const { data, error } = await supabase.from("projects").select("*");

if (error) {
  // Zeige User-freundliche Meldung
  toast.error("Fehler beim Laden der Projekte");
  // Logge Details für Debugging
  console.error(error);
  return;
}
```

## Häufige Fehler

### "permission denied for table"
→ RLS ist aktiv aber keine passende Policy existiert

### "JWT expired"
→ Session ist abgelaufen, User muss sich neu einloggen

### "duplicate key value violates unique constraint"
→ Du versuchst einen Eintrag mit existierender ID zu erstellen

## Weiterführende Ressourcen

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

*Nächster Schritt: Lerne wie du [Authentifizierung mit Supabase](/toolkit/guides/supabase-auth) implementierst.*',
  'beginner',
  '30 min',
  ARRAY['cursor', 'claude-code', 'lovable'],
  ARRAY['supabase', 'database', 'backend', 'setup'],
  true,
  'LaunchOS Team'
FROM toolkit_categories c WHERE c.slug = 'database'
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

-- Guide: Cursor Workflow
INSERT INTO toolkit_guides (
  category_id, slug, title, subtitle, description, content_md,
  difficulty, estimated_time, tools, tags, is_featured, author_name
)
SELECT
  c.id,
  'cursor-workflow-guide',
  'Cursor Workflow: Produktiv coden mit AI',
  'Wie du Cursor effektiv nutzt und 10x schneller entwickelst',
  'Lerne die besten Cursor-Workflows, Shortcuts und Prompting-Strategien für maximale Produktivität.',
  E'# Cursor Workflow: Produktiv coden mit AI

Cursor ist der mächtigste AI-Code-Editor - wenn du weißt wie man ihn richtig nutzt. Dieser Guide zeigt dir die Workflows die wirklich funktionieren.

## Setup für maximale Produktivität

### 1. Projekt indexieren

Cursor muss dein Projekt verstehen. Beim ersten Öffnen:

1. Warte bis die Indexierung abgeschlossen ist
2. Prüfe unten rechts: "Indexed X files"

### 2. .cursorrules erstellen

Diese Datei sagt Cursor wie er mit deinem Projekt umgehen soll:

```markdown
# Project: LaunchOS

## Tech Stack
- React 18 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Supabase for backend
- Framer Motion for animations

## Code Style
- Use functional components with hooks
- Prefer named exports
- Use TypeScript strict mode
- Follow existing patterns in codebase

## File Structure
- Components in src/components/
- Pages in src/pages/
- Hooks in src/hooks/
- Types in src/types/

## Naming Conventions
- Components: PascalCase (UserProfile.tsx)
- Hooks: camelCase with use prefix (useAuth.ts)
- Utils: camelCase (formatDate.ts)
- Types: PascalCase (User, Project)

## Important
- Always use Tailwind for styling
- Never use inline styles
- Always handle loading and error states
- Use Supabase for all data operations
```

### 3. Wichtige Shortcuts lernen

| Shortcut | Funktion |
|----------|----------|
| `Cmd + K` | Inline Edit (Code an Cursor-Position) |
| `Cmd + L` | Chat öffnen |
| `Cmd + Shift + L` | Selektion zum Chat hinzufügen |
| `Cmd + I` | Composer (Multi-File Editing) |
| `@` | Context hinzufügen |

## Die 4 Haupt-Workflows

### Workflow 1: Inline Edit (Cmd + K)

Für kleine, fokussierte Änderungen:

1. Platziere Cursor an der richtigen Stelle
2. `Cmd + K`
3. Beschreibe die Änderung

**Beispiel:**
```
Add error handling for network failures
```

### Workflow 2: Chat (Cmd + L)

Für Fragen, Erklärungen und Code-Reviews:

1. `Cmd + L` öffnet Chat
2. Nutze `@` für Kontext:
   - `@file` - Spezifische Datei
   - `@folder` - Ganzen Ordner
   - `@codebase` - Gesamtes Projekt
   - `@docs` - Externe Dokumentation

**Beispiel:**
```
@codebase Erkläre wie die Authentifizierung funktioniert
```

### Workflow 3: Composer (Cmd + I)

Für größere Features die mehrere Dateien betreffen:

1. `Cmd + I` öffnet Composer
2. Beschreibe das Feature
3. Cursor zeigt alle Änderungen
4. Review und Accept/Reject

**Beispiel:**
```
Create a new Settings page with:
- Profile section (name, email)
- Password change form
- Delete account button with confirmation
- Use existing auth hook
- Match the styling of other pages
```

### Workflow 4: @codebase für Kontext

Für projektweite Fragen und Änderungen:

```
@codebase Welche API-Endpoints werden verwendet?
```

```
@codebase Refactor all forms to use react-hook-form
```

## Prompting Best Practices

### ✅ Gut: Spezifisch und kontextreich

```
Create a useProjects hook that:
- Fetches projects from Supabase where user_id matches current user
- Returns { projects, isLoading, error, createProject, deleteProject }
- Uses the existing supabase client from @/lib/supabase
- Follows the pattern of useAuth hook
```

### ❌ Schlecht: Vage

```
Make a hook for projects
```

### ✅ Gut: Mit Beispiel

```
Add a status badge to ProjectCard, similar to how we show status in @file:ContactCard.tsx
```

### ✅ Gut: Einschränkungen nennen

```
Create the component using only Tailwind classes, no external UI libraries.
Do not modify any existing files.
```

## Multi-File Editing mit Composer

Der Composer ist perfekt für Features die mehrere Dateien ändern:

```
Implement a notification system:

1. Create src/hooks/useNotifications.ts
   - Subscribe to Supabase realtime
   - Return notifications array and markAsRead function

2. Create src/components/NotificationBell.tsx
   - Show bell icon with badge count
   - Dropdown with notification list
   - Mark as read on click

3. Update src/components/layout/Header.tsx
   - Add NotificationBell next to user menu

4. Create src/types/notification.ts
   - Define Notification interface

Follow existing code patterns and use Tailwind for styling.
```

## Debugging mit Cursor

### Fehler beheben

1. Kopiere die Fehlermeldung
2. `Cmd + L` für Chat
3. Füge Fehler ein mit Kontext:

```
I get this error when clicking the submit button:

TypeError: Cannot read property ''id'' of undefined

@file:ContactForm.tsx

How do I fix this?
```

### Code verstehen

```
@file:useAuth.ts Explain what happens when a user logs in, step by step
```

## Performance-Tipps

### 1. Kleinere Kontexte = Bessere Ergebnisse

Statt:
```
@codebase Fix the bug
```

Besser:
```
@file:UserProfile.tsx @file:useUser.ts Fix the undefined user error
```

### 2. Iterativ arbeiten

Statt alles auf einmal:
1. Erst die Datenstruktur
2. Dann den Hook
3. Dann die UI
4. Dann Styling

### 3. Generierte Änderungen reviewen

- Lies jeden Diff bevor du Accept klickst
- AI macht Fehler - du bist der Reviewer
- Bei Unsicherheit: Reject und neu prompten

## Häufige Fehler vermeiden

### ❌ Blind akzeptieren
Immer den generierten Code prüfen!

### ❌ Zu große Änderungen auf einmal
Lieber mehrere kleine Prompts als ein riesiger.

### ❌ Keinen Kontext geben
Nutze `@file`, `@folder`, `@codebase` großzügig.

### ❌ .cursorrules vergessen
Diese Datei spart dir Stunden an Prompting.

## Fazit

Cursor ist ein Tool - du bist immer noch der Entwickler. Die AI beschleunigt deine Arbeit enorm, aber:

- **Du** triffst die Architektur-Entscheidungen
- **Du** reviewst den Code
- **Du** bist verantwortlich für Qualität

Mit den richtigen Workflows wirst du 5-10x produktiver. Aber Übung macht den Meister!

---

*Tipp: Nutze die [Prompt-Bibliothek](/toolkit/prompts) für erprobte Cursor-Prompts.*',
  'intermediate',
  '25 min',
  ARRAY['cursor'],
  ARRAY['cursor', 'workflow', 'productivity', 'prompting'],
  true,
  'LaunchOS Team'
FROM toolkit_categories c WHERE c.slug = 'tool-guides'
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

-- Guide: Vercel Deployment
INSERT INTO toolkit_guides (
  category_id, slug, title, subtitle, description, content_md,
  difficulty, estimated_time, tools, tags, is_featured, author_name
)
SELECT
  c.id,
  'vercel-deployment-guide',
  'Von localhost zu Production: Vercel Deployment',
  'Deine App ist bereit - so bringst du sie online',
  'Komplette Anleitung für das Deployment deiner React/Next.js App auf Vercel mit Custom Domain und Environment Variables.',
  E'# Von localhost zu Production: Vercel Deployment

Deine App läuft lokal perfekt. Zeit sie der Welt zu zeigen! In diesem Guide lernst du wie du professionell auf Vercel deployest.

## Warum Vercel?

- ✅ Kostenloser Hobby-Plan
- ✅ Automatische Deployments bei Git Push
- ✅ Preview Deployments für PRs
- ✅ Edge Network (schnell weltweit)
- ✅ Einfache Custom Domains
- ✅ Environment Variables Management

## Voraussetzungen

- [ ] Code in Git Repository (GitHub, GitLab, Bitbucket)
- [ ] Build läuft lokal fehlerfrei (`npm run build`)
- [ ] Alle Environment Variables dokumentiert

## Step 1: Vercel Account & Projekt

1. Gehe zu [vercel.com](https://vercel.com)
2. "Sign Up" mit GitHub
3. "Add New Project"
4. Wähle dein Repository
5. Vercel erkennt automatisch das Framework

## Step 2: Build Settings prüfen

Vercel erkennt die meisten Frameworks automatisch:

| Framework | Build Command | Output Directory |
|-----------|--------------|------------------|
| Vite | `npm run build` | `dist` |
| Next.js | `npm run build` | `.next` |
| Create React App | `npm run build` | `build` |

Falls nötig, passe unter **Settings > General** an.

## Step 3: Environment Variables

**KRITISCH:** Ohne die richtigen Env Vars funktioniert deine App nicht!

1. Gehe zu **Settings > Environment Variables**
2. Füge alle Variablen hinzu:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

> ⚠️ **Wichtig:**
> - Variablen mit `VITE_` Prefix sind im Frontend sichtbar
> - Sensible Keys (API Secrets) gehören in Server-Side Code

### Environment-Typen

| Typ | Wofür |
|-----|-------|
| Production | Live-Site |
| Preview | PR-Previews |
| Development | Lokal mit `vercel dev` |

Für die meisten Variablen: Alle drei aktivieren.

## Step 4: Erstes Deployment

Nach dem Setup:
1. Klicke "Deploy"
2. Warte auf Build (1-3 Minuten)
3. Prüfe die generierte URL: `your-project.vercel.app`

## Step 5: Custom Domain (Optional)

### Eigene Domain verbinden

1. **Settings > Domains**
2. Domain eingeben: `meinstartup.de`
3. DNS-Einstellungen bei deinem Provider:

```
Typ: A
Name: @
Value: 76.76.21.21

Typ: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Warte auf DNS-Propagation (bis zu 48h, meist schneller)
5. SSL-Zertifikat wird automatisch erstellt

### Subdomain für Staging

```
staging.meinstartup.de → Preview Deployments
meinstartup.de → Production
```

## Step 6: Automatische Deployments

Vercel deployed automatisch bei:
- **Push zu main** → Production Deployment
- **Push zu anderen Branches** → Preview Deployment
- **Pull Request** → Preview mit Kommentar-Link

### Branch-Konfiguration

Unter **Settings > Git**:
- Production Branch: `main`
- Preview Branches: Alle anderen

## Troubleshooting

### Build schlägt fehl

1. Prüfe Build-Logs in Vercel
2. Häufige Ursachen:
   - Fehlende Environment Variables
   - TypeScript Errors
   - Dependency-Probleme

```bash
# Lokal testen
npm run build
```

### 404 bei Direktlinks

Bei Single Page Apps (React Router):

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Environment Variables nicht verfügbar

- Prüfe dass sie für das richtige Environment gesetzt sind
- Bei Vite: Müssen mit `VITE_` beginnen
- Nach Änderung: Redeploy notwendig

### Deployment hängt

1. Cancel und neu starten
2. Prüfe ob `package-lock.json` committed ist
3. Cache leeren: **Settings > General > Clear Build Cache**

## Best Practices

### 1. Preview Deployments nutzen

Jeder PR bekommt eine eigene URL. Perfekt zum Testen!

### 2. Environment pro Stage

```
Production:  VITE_API_URL=https://api.meinstartup.de
Preview:     VITE_API_URL=https://staging-api.meinstartup.de
```

### 3. Deployment Protection

Unter **Settings > Deployment Protection**:
- Passwort für Preview-Deployments
- Nur Team-Mitglieder können zugreifen

### 4. Analytics aktivieren

Vercel Analytics (kostenlos) zeigt:
- Web Vitals
- Page Views
- Performance

### 5. Monitoring

Verbinde mit:
- [Sentry](https://sentry.io) für Error Tracking
- [LogRocket](https://logrocket.com) für Session Replay

## Checkliste nach Deployment

```
□ App lädt ohne Errors
□ Auth funktioniert
□ Datenbank-Verbindung funktioniert
□ Alle Features getestet
□ HTTPS aktiv (grünes Schloss)
□ Mobile Version geprüft
□ Console ohne Fehler
```

## Fazit

Vercel macht Deployment einfach - aber vergiss nicht:

1. **Environment Variables korrekt setzen**
2. **Erst lokal testen, dann deployen**
3. **Preview Deployments für QA nutzen**

Deine App ist jetzt live! 🚀

---

*Nächster Schritt: Prüfe die [Go-Live Checklist](/toolkit/checklists/go-live) um sicherzugehen dass alles bereit ist.*',
  'beginner',
  '20 min',
  ARRAY['cursor', 'claude-code', 'lovable', 'bolt'],
  ARRAY['deployment', 'vercel', 'hosting', 'production'],
  true,
  'LaunchOS Team'
FROM toolkit_categories c WHERE c.slug = 'deployment'
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

-- Guide: API Keys & Secrets
INSERT INTO toolkit_guides (
  category_id, slug, title, subtitle, description, content_md,
  difficulty, estimated_time, tools, tags, is_featured, author_name
)
SELECT
  c.id,
  'api-keys-secrets-guide',
  'API Keys & Secrets: Richtig verwalten',
  'Wie du sensible Daten sicher handhabst',
  'Lerne den sicheren Umgang mit API Keys, Secrets und Environment Variables - der häufigste Fehler bei Anfängern.',
  E'# API Keys & Secrets: Richtig verwalten

Der #1 Fehler den Anfänger machen: API-Keys im Code. Dieser Guide zeigt dir wie es richtig geht.

## Das Problem

```typescript
// ❌ NIEMALS SO!
const openaiKey = "sk-abc123...";
const stripeKey = "sk_live_...";
```

**Warum ist das gefährlich?**

1. Jeder kann deinen Code sehen (DevTools, GitHub)
2. Keys werden gescraped und missbraucht
3. Du bekommst eine Rechnung über $10.000+
4. Dein Account wird gesperrt

## Die Lösung: Environment Variables

### Schritt 1: .env Datei erstellen

```bash
# .env (im Root-Verzeichnis)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Sensible Keys - NUR serverseitig!
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
```

### Schritt 2: .gitignore prüfen

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

> ⚠️ **KRITISCH:** Wenn `.env` einmal committed wurde, sind die Keys kompromittiert!

### Schritt 3: Im Code verwenden

```typescript
// ✅ So richtig
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

## Was darf ins Frontend?

### ✅ Okay fürs Frontend (mit `VITE_` Prefix)

- Supabase URL
- Supabase Anon Key (hat RLS Schutz)
- Public API Keys (z.B. Google Maps)
- Analytics IDs

### ❌ Niemals ins Frontend

- OpenAI API Key
- Stripe Secret Key
- Database Passwords
- JWT Secrets
- Admin-Credentials

## Sensible Operations: Edge Functions

Für sensible API-Calls nutze Server-Side Code:

```typescript
// supabase/functions/generate-text/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Key ist nur auf dem Server
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello" }],
    }),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Frontend ruft nur die Edge Function auf:

```typescript
// Frontend
const { data, error } = await supabase.functions.invoke("generate-text", {
  body: { prompt: userInput },
});
```

## Environment Variables bei Hostern

### Vercel

1. **Settings > Environment Variables**
2. Variable hinzufügen
3. Environments wählen (Production/Preview/Development)

### Supabase Edge Functions

1. **Settings > Edge Functions**
2. **Secrets** Tab
3. Secret hinzufügen

### Netlify

1. **Site Settings > Environment Variables**
2. Variable hinzufügen

## Best Practices

### 1. Unterschiedliche Keys pro Environment

```
# .env.development
VITE_API_URL=http://localhost:3000

# Production (Vercel)
VITE_API_URL=https://api.meinstartup.de
```

### 2. Key Rotation

Ändere Keys regelmäßig, besonders wenn:
- Mitarbeiter das Team verlassen
- Keys versehentlich exposed wurden
- Verdächtige Aktivität

### 3. Minimal Permissions

Erstelle Keys mit minimalen Rechten:
- Read-Only wenn möglich
- Scope auf spezifische Ressourcen
- Rate Limits aktivieren

### 4. Secrets Manager (für größere Teams)

- [Doppler](https://doppler.com)
- [1Password Secrets](https://1password.com)
- [HashiCorp Vault](https://vaultproject.io)

## Was tun wenn ein Key geleakt ist?

1. **SOFORT den Key revoken** (Dashboard des Providers)
2. Neuen Key erstellen
3. Alle Deployments updaten
4. Git History prüfen (Key war in Commits?)
5. Logs prüfen auf unauthorisierte Nutzung

### Git History bereinigen

Wenn ein Key in Git committed wurde:

```bash
# BFG Repo-Cleaner
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

> ⚠️ Das ändert die Git History. Koordiniere mit deinem Team!

## Checkliste

```
□ .env in .gitignore
□ Keine Keys im Code
□ Sensible Keys nur serverseitig
□ Keys bei Hoster gesetzt
□ Unterschiedliche Keys pro Environment
□ Git History sauber
```

## Fazit

API-Key Management ist nicht sexy, aber essentiell. Eine Minute Nachlässigkeit kann tausende Euro kosten.

**Regel:** Wenn du dir unsicher bist ob ein Key ins Frontend darf - dann gehört er auf den Server.

---

*Nutze die [MVP-Readiness Checklist](/toolkit/checklists/mvp-readiness) um Security-Basics zu prüfen.*',
  'beginner',
  '15 min',
  ARRAY['cursor', 'claude-code', 'lovable', 'bolt'],
  ARRAY['security', 'api-keys', 'environment-variables', 'secrets'],
  true,
  'LaunchOS Team'
FROM toolkit_categories c WHERE c.slug = 'best-practices'
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

-- Guide: Claude Code Workflow
INSERT INTO toolkit_guides (
  category_id, slug, title, subtitle, description, content_md,
  difficulty, estimated_time, tools, tags, is_featured, author_name
)
SELECT
  c.id,
  'claude-code-workflow-guide',
  'Claude Code: Der Terminal-Agent für Profis',
  'Autonome Entwicklung mit Anthropic''s Coding-Agent',
  'Lerne wie du Claude Code für komplexe Entwicklungsaufgaben einsetzt - vom Setup bis zu fortgeschrittenen Workflows.',
  E'# Claude Code: Der Terminal-Agent für Profis

Claude Code ist anders als andere AI-Coding-Tools. Es ist ein autonomer Agent der komplexe Aufgaben selbstständig ausführt.

## Was macht Claude Code besonders?

| Feature | Claude Code | Cursor | Lovable |
|---------|-------------|--------|---------|
| Autonomie | Sehr hoch | Mittel | Niedrig |
| Multi-File | Excellent | Gut | Begrenzt |
| Terminal | Voll | Begrenzt | Nein |
| Git | Integriert | Manuell | Nein |
| Komplexität | Sehr hoch | Hoch | Niedrig |

## Installation & Setup

```bash
# Via npm
npm install -g @anthropic-ai/claude-code

# Oder mit Homebrew (Mac)
brew install claude-code
```

### API Key setzen

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Oder in `~/.bashrc` / `~/.zshrc` für permanente Nutzung.

## Grundlegende Nutzung

### Projekt starten

```bash
cd mein-projekt
claude
```

Claude indexiert automatisch dein Projekt und ist bereit.

### Einfache Aufgaben

```
> Erkläre die Struktur dieses Projekts
```

```
> Finde alle TODO-Kommentare
```

### Entwicklungsaufgaben

```
> Erstelle einen neuen Hook useNotifications der Realtime-Benachrichtigungen von Supabase subscribed
```

Claude wird:
1. Die bestehende Codebase analysieren
2. Ähnliche Patterns finden
3. Den Code schreiben
4. Relevante Imports hinzufügen
5. Types erstellen wenn nötig

## CLAUDE.md - Dein Projekt-Kontext

Die wichtigste Datei für Claude Code:

```markdown
# CLAUDE.md

## Projekt: LaunchOS

### Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth, Database, Edge Functions)
- Framer Motion

### Architektur
src/
├── components/    # Wiederverwendbare UI-Komponenten
├── pages/         # Seiten-Komponenten
├── hooks/         # Custom React Hooks
├── contexts/      # React Context Provider
├── lib/           # Utilities und Konfiguration
├── types/         # TypeScript Definitionen
└── styles/        # Globale Styles

### Konventionen
- Komponenten: PascalCase, .tsx Endung
- Hooks: useXxx, .ts Endung
- Alle Komponenten sind funktional mit Hooks
- Tailwind für Styling, keine CSS-Dateien
- Supabase für alle Backend-Operationen

### Wichtige Dateien
- src/lib/supabase.ts - Supabase Client
- src/contexts/AuthContext.tsx - Auth State
- src/hooks/useAuth.ts - Auth Hook

### Branding
- Primary: Purple (#9333ea)
- Accent: Pink (#ec4899)
- Gradients: from-purple-600 to-pink-600

### Patterns
- Loading States mit Skeleton
- Error Boundaries für Fehler
- Toast Notifications für Feedback
- Optimistic Updates bei Mutations
```

## Fortgeschrittene Workflows

### Workflow 1: Feature Development

```
> Implementiere eine komplette Settings-Seite mit:
> 1. Profil bearbeiten (Name, Email, Avatar)
> 2. Passwort ändern
> 3. Benachrichtigungs-Einstellungen
> 4. Account löschen mit Bestätigung
>
> Erstelle alle nötigen Komponenten, Hooks und Supabase-Queries.
> Folge den bestehenden Patterns.
```

Claude wird mehrere Dateien erstellen und Git-Commits machen.

### Workflow 2: Refactoring

```
> Refactore alle Form-Komponenten zu react-hook-form.
> Erstelle wiederverwendbare Form-Komponenten.
> Update alle bestehenden Forms.
> Stelle sicher dass Validierung weiterhin funktioniert.
```

### Workflow 3: Bug Investigation

```
> Im InvestorCRM gibt es einen Bug: Wenn man einen Kontakt verschiebt,
> wird die Stage nicht korrekt aktualisiert.
>
> 1. Analysiere den relevanten Code
> 2. Finde die Ursache
> 3. Implementiere einen Fix
> 4. Erkläre was das Problem war
```

### Workflow 4: Testing

```
> Schreibe Tests für den useAuth Hook.
> Nutze Vitest und React Testing Library.
> Teste: Login, Logout, Session Persistence, Error Handling.
```

## Best Practices

### 1. Klare, strukturierte Prompts

```
# Gut
> Erstelle einen neuen Endpoint /api/send-email:
> - Input: { to: string, subject: string, body: string }
> - Nutze Resend für den Versand
> - Validiere Input mit Zod
> - Handle Errors gracefully
> - Return: { success: boolean, messageId?: string }

# Schlecht
> Mach einen Email-Endpoint
```

### 2. Schrittweise arbeiten

Statt einer riesigen Aufgabe:

```
1. > Erstelle das Datenbank-Schema für Notifications
2. > Erstelle den useNotifications Hook
3. > Erstelle die NotificationBell Komponente
4. > Integriere in den Header
```

### 3. Code Review

```
> Zeige mir die Änderungen der letzten Session
```

```
> Erkläre warum du diese Architektur-Entscheidung getroffen hast
```

### 4. Git nutzen

```
> Committe die Änderungen mit einer sinnvollen Message
```

```
> Erstelle einen neuen Branch für dieses Feature
```

## Kosten im Blick behalten

Claude Code nutzt die Anthropic API. Kosten:

- **Input:** ~$3 / 1M Tokens
- **Output:** ~$15 / 1M Tokens

**Typischer Tag:** $3-20 je nach Intensität

### Kosten optimieren

1. Gute CLAUDE.md = weniger Kontext-Wiederholung
2. Spezifische Prompts = weniger Iterationen
3. Lokale Dateien statt Web-Lookups

## Häufige Fehler

### ❌ Zu vage Anweisungen

```
> Mach das besser
```

### ❌ Keinen Kontext geben

Ohne CLAUDE.md muss Claude bei jeder Aufgabe neu lernen.

### ❌ Blind vertrauen

Claude ist gut aber nicht perfekt. Immer reviewen!

### ❌ Zu große Schritte

Lieber 5 kleine Aufgaben als eine riesige.

## Wann Claude Code vs. Cursor?

| Situation | Empfehlung |
|-----------|------------|
| Komplexes Feature | Claude Code |
| Quick Fix | Cursor |
| Großes Refactoring | Claude Code |
| UI Tweaks | Cursor |
| Neues Projekt von Null | Claude Code |
| Bestehenden Code verstehen | Beide gut |

## Fazit

Claude Code ist das mächtigste Tool wenn du:
- Komplexe, mehrteilige Aufgaben hast
- Autonomie schätzt
- Terminal-affin bist
- Code-Qualität priorisierst

Es ersetzt nicht dein Urteilsvermögen - aber es beschleunigt deine Arbeit enorm.

---

*Kombiniere Claude Code mit der [Prompt-Bibliothek](/toolkit/prompts) für noch bessere Ergebnisse.*',
  'advanced',
  '30 min',
  ARRAY['claude-code'],
  ARRAY['claude-code', 'workflow', 'terminal', 'agent'],
  true,
  'LaunchOS Team'
FROM toolkit_categories c WHERE c.slug = 'tool-guides'
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


-- ═══════════════════════════════════════════════════════════════
-- 2. GO-LIVE CHECKLIST ITEMS
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_checklist_id UUID;
BEGIN
  -- Get the go-live checklist ID
  SELECT id INTO v_checklist_id FROM toolkit_checklists WHERE slug = 'go-live';

  -- Only proceed if checklist exists
  IF v_checklist_id IS NOT NULL THEN
    -- Delete existing items for this checklist (idempotent)
    DELETE FROM toolkit_checklist_items WHERE checklist_id = v_checklist_id;

    -- Insert all go-live checklist items
    INSERT INTO toolkit_checklist_items (checklist_id, title, description, help_text, section, sort_order, is_critical) VALUES

    -- Section: Pre-Launch
    (v_checklist_id, 'MVP-Readiness Checklist abgeschlossen', 'Alle kritischen Punkte der MVP-Checklist sind erledigt', 'Ohne Basis kein Launch!', 'Pre-Launch', 1, true),
    (v_checklist_id, 'Smoke Test durchgeführt', 'Alle Hauptfunktionen wurden manuell getestet', 'Klicke einmal durch alle Features.', 'Pre-Launch', 2, true),
    (v_checklist_id, 'Production Build erfolgreich', 'npm run build läuft ohne Fehler', 'Behebe alle Build-Errors vor dem Launch.', 'Pre-Launch', 3, true),
    (v_checklist_id, 'Keine Console Errors', 'Browser-Console zeigt keine Fehler', 'Öffne DevTools und prüfe auf Rot.', 'Pre-Launch', 4, false),

    -- Section: Deployment
    (v_checklist_id, 'Production Environment konfiguriert', 'Alle Environment Variables sind auf dem Server gesetzt', 'Vercel > Settings > Environment Variables', 'Deployment', 5, true),
    (v_checklist_id, 'Custom Domain verbunden', 'Die App läuft unter deiner eigenen Domain', 'Optional, aber professioneller.', 'Deployment', 6, false),
    (v_checklist_id, 'SSL/HTTPS aktiv', 'Die URL beginnt mit https://', 'Sollte automatisch sein bei modernen Hostern.', 'Deployment', 7, true),
    (v_checklist_id, 'Supabase Migrations deployed', 'Alle DB-Änderungen sind auf Production', 'npx supabase db push', 'Deployment', 8, true),
    (v_checklist_id, 'Edge Functions deployed', 'Alle Serverless Functions sind live', 'supabase functions deploy', 'Deployment', 9, true),

    -- Section: Legal & Compliance
    (v_checklist_id, 'Impressum mit echten Daten', 'Keine Platzhalter mehr im Impressum', 'Rechtlich verpflichtend für DE!', 'Legal & Compliance', 10, true),
    (v_checklist_id, 'Datenschutzerklärung aktuell', 'Alle verwendeten Services sind aufgeführt', 'DSGVO-Pflicht.', 'Legal & Compliance', 11, true),
    (v_checklist_id, 'Cookie-Banner', 'Falls Cookies genutzt werden: Banner vorhanden', 'Nicht nötig wenn nur technisch notwendige Cookies.', 'Legal & Compliance', 12, false),

    -- Section: Monitoring
    (v_checklist_id, 'Error Tracking eingerichtet', 'Sentry, LogRocket oder ähnlich verbunden', 'Du willst wissen wenn etwas kaputt geht!', 'Monitoring', 13, false),
    (v_checklist_id, 'Analytics eingerichtet', 'Vercel Analytics, Plausible oder ähnlich', 'Verstehe wie User dein Produkt nutzen.', 'Monitoring', 14, false),
    (v_checklist_id, 'Uptime Monitoring', 'BetterStack, UptimeRobot oder ähnlich', 'Werde benachrichtigt wenn die Seite down ist.', 'Monitoring', 15, false),

    -- Section: Communication
    (v_checklist_id, 'Support-Email eingerichtet', 'User können dich kontaktieren', 'support@deinedomain.de oder Kontaktformular.', 'Communication', 16, true),
    (v_checklist_id, 'Feedback-Möglichkeit', 'User können Bugs melden oder Feedback geben', 'Einfacher Link reicht für MVP.', 'Communication', 17, false),
    (v_checklist_id, 'Launch Announcement vorbereitet', 'Text für Social Media, Email etc.', 'Was, warum, für wen, Link.', 'Communication', 18, false),

    -- Section: Backup & Recovery
    (v_checklist_id, 'Datenbank-Backup aktiv', 'Automatische Backups sind konfiguriert', 'Bei Supabase Pro automatisch.', 'Backup & Recovery', 19, false),
    (v_checklist_id, 'Rollback-Plan', 'Du weißt wie du zur vorherigen Version zurückkommst', 'Vercel: Promote previous deployment.', 'Backup & Recovery', 20, false);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- 3. NEUE PROMPTS
-- ═══════════════════════════════════════════════════════════════

-- Prompt: Supabase Auth Integration
INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES (
  'supabase-auth-integration',
  'Supabase Auth in bestehendes Projekt integrieren',
  'Komplette Auth-Integration mit Context, Hooks und UI',
  'Du hast ein bestehendes React-Projekt und willst Supabase Auth hinzufügen',
  E'Integriere Supabase Auth in mein bestehendes React/TypeScript Projekt.

**Projekt:** {{project_name}}
**Aktueller Auth-Status:** {{current_auth}}

Erstelle:

1. **AuthContext** (src/contexts/AuthContext.tsx)
   - User State
   - Loading State
   - Session Management
   - onAuthStateChange Listener

2. **useAuth Hook** (src/hooks/useAuth.ts)
   - signIn(email, password)
   - signUp(email, password)
   - signOut()
   - resetPassword(email)
   - user, isLoading, error

3. **Auth Pages**
   - LoginPage.tsx
   - SignUpPage.tsx
   - ForgotPasswordPage.tsx
   - ResetPasswordPage.tsx

4. **ProtectedRoute Komponente**
   - Redirect zu /login wenn nicht eingeloggt
   - Loading State während Auth-Check

5. **Router Updates**
   - Public Routes: /, /login, /signup
   - Protected Routes: /dashboard, /settings, etc.

Anforderungen:
- Nutze den existierenden Supabase Client: @/lib/supabase
- Tailwind CSS für Styling
- Formular-Validierung mit sinnvollen Error Messages
- Folge dem existierenden Code-Stil',
  '[
    {"name": "project_name", "label": "Projektname", "type": "text", "placeholder": "Mein Startup"},
    {"name": "current_auth", "label": "Aktueller Auth-Status", "type": "select", "options": ["Keine Auth vorhanden", "Basic Auth vorhanden aber kaputt", "Andere Auth die ersetzt werden soll"]}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['auth', 'supabase', 'integration'],
  true,
  7
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Prompt: Component to Full Feature
INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES (
  'component-to-feature',
  'UI-Komponente zu vollem Feature erweitern',
  'Nimm eine bestehende UI-Komponente und mache sie funktionsfähig',
  'Du hast eine UI-Komponente (z.B. von Lovable) aber sie ist nur visuell',
  E'Ich habe folgende UI-Komponente die nur visuell ist. Mache sie zu einem vollen Feature:

**Komponente:** {{component_path}}
**Beschreibung:** {{description}}

Die Komponente soll:
{{required_functionality}}

Erstelle:

1. **Datenbank-Tabelle** (falls nötig)
   - SQL Migration mit RLS
   - TypeScript Types

2. **Custom Hook**
   - CRUD Operationen
   - Loading/Error States
   - Optimistic Updates

3. **Komponente erweitern**
   - Hook integrieren
   - Echte Daten statt Dummy-Daten
   - Event Handler implementieren
   - Loading States
   - Error Handling
   - Empty State

4. **Tests** (optional)
   - Hook Tests
   - Komponenten Tests

Behalte das existierende Styling bei.
Nutze Supabase für Backend-Operationen.',
  '[
    {"name": "component_path", "label": "Komponenten-Pfad", "type": "text", "placeholder": "src/components/ContactList.tsx"},
    {"name": "description", "label": "Was macht die Komponente?", "type": "textarea", "placeholder": "Zeigt eine Liste von Kontakten an"},
    {"name": "required_functionality", "label": "Gewünschte Funktionalität", "type": "textarea", "placeholder": "- Kontakte laden\\n- Kontakt hinzufügen\\n- Kontakt bearbeiten\\n- Kontakt löschen"}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['feature', 'integration', 'full-stack'],
  true,
  8
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Prompt: Code Review
INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES (
  'code-review',
  'Code Review anfordern',
  'Lass deinen Code von der AI reviewen',
  'Du willst Feedback zu deinem Code bevor du committest',
  E'Bitte reviewe folgenden Code:

**Datei(en):** {{files}}

**Kontext:** {{context}}

Review-Fokus:
{{review_focus}}

Prüfe auf:
1. **Bugs & Fehler**
   - Logikfehler
   - Edge Cases
   - Null/Undefined Handling

2. **Security**
   - Input Validation
   - Auth Checks
   - Sensitive Data Exposure

3. **Performance**
   - Unnecessary Re-renders
   - Memory Leaks
   - N+1 Queries

4. **Code Quality**
   - DRY Violations
   - Naming
   - Readability

5. **Best Practices**
   - React Patterns
   - TypeScript Usage
   - Error Handling

Gib mir:
- Liste der Probleme (sortiert nach Schweregrad)
- Konkrete Verbesserungsvorschläge mit Code
- Positive Aspekte (was ist gut)',
  '[
    {"name": "files", "label": "Datei(en) zum Review", "type": "textarea", "placeholder": "@file:UserProfile.tsx\\n@file:useUser.ts"},
    {"name": "context", "label": "Was macht der Code?", "type": "textarea", "placeholder": "User-Profil Seite mit Edit-Funktionalität"},
    {"name": "review_focus", "label": "Worauf soll ich besonders achten?", "type": "textarea", "placeholder": "- Security\\n- Performance bei vielen Usern"}
  ]'::jsonb,
  NULL,
  'any',
  ARRAY['code-review', 'quality', 'best-practices'],
  false,
  9
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Prompt: Responsive Design
INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES (
  'responsive-design',
  'Komponente responsive machen',
  'Desktop-Only Komponente für Mobile optimieren',
  'Deine Komponente sieht auf Desktop gut aus aber nicht auf Mobile',
  E'Mache folgende Komponente responsive:

**Komponente:** {{component_path}}

**Aktuelle Breakpoints die funktionieren:** {{working_breakpoints}}
**Probleme auf:** {{problem_breakpoints}}

Anforderungen:
- Mobile First Approach
- Tailwind Breakpoints nutzen (sm, md, lg, xl)
- Touch-friendly (min 44px tap targets)
- Keine horizontale Scrollbars
- Lesbare Font-Größen auf Mobile

Spezifische Anpassungen:
{{specific_changes}}

Behalte die Desktop-Version bei, füge Mobile-Styles hinzu.
Teste gedanklich auf: iPhone SE, iPhone 14, iPad, Desktop.',
  '[
    {"name": "component_path", "label": "Komponente", "type": "text", "placeholder": "@file:Dashboard.tsx"},
    {"name": "working_breakpoints", "label": "Funktioniert auf", "type": "text", "placeholder": "lg und größer"},
    {"name": "problem_breakpoints", "label": "Probleme auf", "type": "text", "placeholder": "Mobile (< 768px)"},
    {"name": "specific_changes", "label": "Spezifische Wünsche", "type": "textarea", "placeholder": "- Sidebar wird zu Bottom-Nav\\n- Cards stapeln sich vertikal\\n- Tabelle wird zu Cards"}
  ]'::jsonb,
  NULL,
  'any',
  ARRAY['responsive', 'mobile', 'css', 'tailwind'],
  false,
  10
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Prompt: Performance Optimization
INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES (
  'performance-optimization',
  'Performance optimieren',
  'Langsame Komponente oder Seite beschleunigen',
  'Deine App fühlt sich träge an oder lädt langsam',
  E'Optimiere die Performance folgender Komponente/Seite:

**Datei:** {{file_path}}
**Problem:** {{problem_description}}

Analysiere und optimiere:

1. **React Performance**
   - Unnecessary Re-renders (React.memo, useMemo, useCallback)
   - Component Splitting
   - Lazy Loading

2. **Data Fetching**
   - Caching (React Query, SWR)
   - Pagination
   - Optimistic Updates

3. **Bundle Size**
   - Dynamic Imports
   - Tree Shaking
   - Dependency Analyse

4. **Rendering**
   - Virtualization für lange Listen
   - Skeleton Loading
   - Suspense Boundaries

5. **Assets**
   - Image Optimization
   - Font Loading

Messungen:
- Vorher/Nachher mit React DevTools Profiler
- Lighthouse Score Verbesserung

Gib mir konkrete Code-Änderungen mit Erklärung warum sie helfen.',
  '[
    {"name": "file_path", "label": "Datei", "type": "text", "placeholder": "@file:ContactList.tsx"},
    {"name": "problem_description", "label": "Was ist langsam?", "type": "textarea", "placeholder": "Die Liste mit 500+ Kontakten ruckelt beim Scrollen und Filter sind träge"}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['performance', 'optimization', 'react'],
  false,
  11
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Prompt: Lovable to Production
INSERT INTO toolkit_prompts (
  slug, title, description, use_case, prompt_template, variables, example_output, target_tool, tags, is_featured, sort_order
) VALUES (
  'lovable-to-production',
  'Lovable-Projekt production-ready machen',
  'Exportiertes Lovable-Projekt für echten Launch vorbereiten',
  'Du hast ein Lovable-Projekt exportiert und willst es productionisieren',
  E'Mein Lovable-Projekt ist exportiert. Mache es production-ready:

**Projektbeschreibung:** {{project_description}}

Aktueller Status:
- UI ist fertig und sieht gut aus
- Keine echte Datenbank (nur localStorage/Demo)
- Keine echte Auth
- Nicht deployed

Tasks:

1. **Supabase Setup**
   - Tabellen basierend auf dem vorhandenen Datenmodell erstellen
   - RLS Policies
   - Migrations erstellen

2. **Auth Integration**
   - Supabase Auth einbauen
   - Login/Signup Pages
   - Protected Routes
   - Session Management

3. **Backend verbinden**
   - localStorage durch Supabase Queries ersetzen
   - Hooks für Datenoperationen
   - Error Handling

4. **Environment Setup**
   - .env Datei
   - Vercel Environment Variables
   - API Keys sichern

5. **Cleanup**
   - Demo-Daten entfernen
   - Console.logs entfernen
   - TypeScript Errors fixen

6. **Deployment**
   - Vercel Konfiguration
   - Production Build testen

Gib mir einen strukturierten Plan und dann Schritt für Schritt die Implementierung.',
  '[
    {"name": "project_description", "label": "Was macht dein Projekt?", "type": "textarea", "placeholder": "Ein CRM für Freelancer mit Projekt-Tracking und Rechnungsstellung", "required": true}
  ]'::jsonb,
  NULL,
  'cursor',
  ARRAY['lovable', 'production', 'migration'],
  true,
  12
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  use_case = EXCLUDED.use_case,
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  target_tool = EXCLUDED.target_tool,
  tags = EXCLUDED.tags,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();


-- ═══════════════════════════════════════════════════════════════
-- 4. TOOL LOGOS
-- ═══════════════════════════════════════════════════════════════

UPDATE toolkit_tools SET logo_url = 'https://lovable.dev/favicon.ico' WHERE slug = 'lovable';
UPDATE toolkit_tools SET logo_url = 'https://bolt.new/favicon.ico' WHERE slug = 'bolt';
UPDATE toolkit_tools SET logo_url = 'https://cursor.sh/favicon.ico' WHERE slug = 'cursor';
UPDATE toolkit_tools SET logo_url = 'https://claude.ai/favicon.ico' WHERE slug = 'claude-code';
UPDATE toolkit_tools SET logo_url = 'https://v0.dev/favicon.ico' WHERE slug = 'v0';
UPDATE toolkit_tools SET logo_url = 'https://replit.com/public/icons/favicon-196.png' WHERE slug = 'replit';
