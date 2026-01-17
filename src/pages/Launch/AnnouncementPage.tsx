/**
 * Announcement Templates Page
 * Pre-written templates for launch announcements
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Copy,
  Check,
  Linkedin,
  Twitter,
  Mail,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface Template {
  id: string;
  title: string;
  platform: 'linkedin' | 'twitter' | 'email' | 'producthunt';
  language: 'de' | 'en';
  icon: React.ReactNode;
  content: string;
  tips?: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'linkedin-de',
    title: 'LinkedIn Post (Deutsch)',
    platform: 'linkedin',
    language: 'de',
    icon: <Linkedin className="w-5 h-5" />,
    content: `🚀 Heute launche ich LaunchOS - die All-in-One Plattform für Startup-Gründer.

Nach [X] Wochen Entwicklung ist es soweit: Von der Idee bis zum Investor-Pitch - alles an einem Ort.

Was LaunchOS kann:

🧰 Builder's Toolkit
→ Guides, Checklists & Prompts für AI-Coding-Tools (Lovable, Cursor, etc.)
→ Basierend auf 50+ Tagen echter Erfahrung
→ Vermeide die Fehler die ich gemacht habe

💬 AI-Coach
→ Beratung zu jedem Gründer-Thema
→ Dokumente generieren (Pitch Deck, One-Pager, etc.)
→ Immer verfügbar, immer geduldig

📊 Investor CRM & Data Room
→ Investoren tracken mit Kanban-Board
→ Sicherer Data Room für Due Diligence
→ Analytics Dashboard

Das Besondere: LaunchOS begleitet dich von der ersten Idee bis zum Investor-Meeting.

🔗 Jetzt kostenlos testen: [URL]

Gebaut mit: React, Supabase, Claude AI, Vercel

Feedback sehr willkommen! 🙏

#startup #gründer #ai #buildinpublic`,
    tips: [
      'Ersetze [X] mit der tatsächlichen Entwicklungszeit',
      'Füge deine URL ein',
      'Füge 1-2 Screenshots als Bilder hinzu',
      'Tagge relevante Personen in den Kommentaren',
    ],
  },
  {
    id: 'linkedin-en',
    title: 'LinkedIn Post (English)',
    platform: 'linkedin',
    language: 'en',
    icon: <Linkedin className="w-5 h-5" />,
    content: `🚀 Today I'm launching LaunchOS - the all-in-one platform for startup founders.

After [X] weeks of building, it's finally here: From idea to investor pitch - all in one place.

What LaunchOS does:

🧰 Builder's Toolkit
→ Guides, checklists & prompts for AI coding tools (Lovable, Cursor, etc.)
→ Based on 50+ days of real experience
→ Avoid the mistakes I made

💬 AI Coach
→ Advice on any founder topic
→ Generate documents (pitch deck, one-pager, etc.)
→ Always available, always patient

📊 Investor CRM & Data Room
→ Track investors with Kanban board
→ Secure data room for due diligence
→ Analytics dashboard

What's special: LaunchOS guides you from first idea to investor meeting.

🔗 Try it free: [URL]

Built with: React, Supabase, Claude AI, Vercel

Feedback welcome! 🙏

#startup #founder #ai #buildinpublic`,
    tips: [
      'Replace [X] with actual development time',
      'Add your URL',
      'Include 1-2 screenshots as images',
      'Tag relevant people in comments',
    ],
  },
  {
    id: 'twitter-thread',
    title: 'Twitter/X Thread',
    platform: 'twitter',
    language: 'en',
    icon: <Twitter className="w-5 h-5" />,
    content: `Tweet 1:
🚀 Shipped: LaunchOS

The all-in-one platform for startup founders.

From idea → build → launch → fund.

Here's what 50+ days of building AI-coded products taught me 🧵

---

Tweet 2:
Problem: AI tools like Lovable and Bolt generate beautiful UIs.

But most founders don't realize: that's NOT a product.

You need:
- Real database
- Auth
- Security
- Deployment

LaunchOS teaches you what's actually needed.

---

Tweet 3:
🧰 Builder's Toolkit

- Tool comparisons (Lovable vs Cursor vs Claude Code)
- MVP-Readiness Checklist (23 items)
- Copy-paste prompt library
- Common mistakes to avoid

All from real experience, not theory.

---

Tweet 4:
💬 AI Coach

Ask anything:
"Help me with my pitch"
"What VCs invest in HealthTech?"
"Generate a one-pager"

Context-aware. Always available.

---

Tweet 5:
📊 Investor CRM + Data Room

- Kanban board for pipeline
- Drag & drop stages
- Secure file sharing
- Access analytics

No more spreadsheet chaos.

---

Tweet 6:
Stack:
- React + TypeScript
- Tailwind CSS
- Supabase (DB, Auth, Edge Functions)
- Claude AI
- Vercel

Open to questions about the build!

---

Tweet 7:
🔗 Try it: [URL]

Free to start.
Feedback very welcome.

RT appreciated if you know founders who need this! 🙏`,
    tips: [
      'Poste jeden Tweet einzeln mit 5-10 Minuten Abstand',
      'Füge GIFs oder Screenshots zu Tweet 3-5 hinzu',
      'Antworte auf alle Kommentare innerhalb der ersten Stunde',
      'Teile den Thread in relevanten Communities',
    ],
  },
  {
    id: 'email-waitlist',
    title: 'Email an Waitlist/Beta-Tester',
    platform: 'email',
    language: 'de',
    icon: <Mail className="w-5 h-5" />,
    content: `Betreff: 🚀 LaunchOS ist live - Dein Zugang ist bereit!

Hallo [Name],

es ist soweit: LaunchOS ist offiziell live!

Du hattest dich für Early Access angemeldet - vielen Dank für deine Geduld. Jetzt kannst du loslegen.

🔗 Hier geht's zur App: [URL]

Was dich erwartet:

✅ Builder's Toolkit
Guides und Checklists für AI-Coding-Tools. Basierend auf echten Erfahrungen.

✅ AI-Coach
Dein persönlicher Startup-Berater. Fragen stellen, Dokumente generieren.

✅ Investor CRM & Data Room
Investoren tracken und Unterlagen sicher teilen.

Als Early User ist dein Feedback besonders wertvoll. Wenn dir etwas auffällt (gut oder schlecht), schreib mir einfach auf diese Email.

Viel Erfolg mit deinem Startup!

Beste Grüße,
[Dein Name]

P.S. Wenn du jemanden kennst, dem LaunchOS helfen könnte - teile diesen Link gerne weiter!`,
    tips: [
      'Personalisiere [Name] wenn möglich',
      'Sende morgens zwischen 9-11 Uhr',
      'Füge einen direkten Link zur App hinzu',
      'Halte die Email kurz und scanbar',
    ],
  },
  {
    id: 'producthunt',
    title: 'ProductHunt Launch',
    platform: 'producthunt',
    language: 'en',
    icon: <ShoppingBag className="w-5 h-5" />,
    content: `TAGLINE (60 Zeichen max):
From idea to investor-ready startup with AI

---

DESCRIPTION:
LaunchOS is the all-in-one platform for first-time founders.

🧰 BUILDER'S TOOLKIT
Learn what a real product needs (not just a pretty UI). Guides, checklists, and prompts for AI coding tools like Lovable, Cursor, and Claude Code. Based on 50+ days of real experience.

💬 AI COACH
Your always-available startup advisor. Ask anything, generate documents (pitch decks, one-pagers), get context-aware guidance.

📊 INVESTOR CRM & DATA ROOM
Track investors with a Kanban board. Share due diligence docs securely. See analytics.

🎯 COMPLETE JOURNEY
LaunchOS guides you from first idea through building, launching, and fundraising.

Built for founders, by a founder. Free to start.

---

MAKER COMMENT:
Hey PH! 👋

I built LaunchOS because I noticed a gap: AI tools generate beautiful UIs, but most founders don't realize that's only 20% of a real product.

After 50+ days of building with AI coding tools, I documented everything - what works, what doesn't, and the mistakes to avoid.

LaunchOS combines that knowledge with an AI coach and investor tools in one platform.

Would love your feedback! What features would help you most?`,
    tips: [
      'Launche an einem Dienstag oder Mittwoch',
      'Starte um 00:01 Uhr PST (9:01 Uhr MEZ)',
      'Bereite 5-10 Screenshots vor',
      'Erstelle ein kurzes Demo-Video (1-2 min)',
      'Informiere dein Netzwerk 24h vorher',
    ],
  },
];

const POST_LAUNCH_CHECKLIST = [
  {
    title: 'Erste 24 Stunden',
    items: [
      'Announcement gepostet (LinkedIn, Twitter, etc.)',
      'Errors monitoren (Sentry Dashboard oder Vercel Logs)',
      'User-Signups beobachten',
      'Auf Feedback reagieren (schnell!)',
      'Kritische Bugs sofort fixen',
    ],
  },
  {
    title: 'Erste Woche',
    items: [
      'Feedback sammeln und kategorisieren',
      'Quick Wins umsetzen (einfache Verbesserungen)',
      'User für Gespräche anfragen',
      'Metriken analysieren (Signups, Aktivierung, Retention)',
    ],
  },
  {
    title: 'Erstes Quartal',
    items: [
      'Regelmäßig neue Features shippen',
      'Community aufbauen',
      'Content erstellen (Blog, Social)',
      'Pricing validieren',
    ],
  },
];

export function AnnouncementPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>('linkedin-de');

  const copyToClipboard = (content: string, templateId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platformColors = {
    linkedin: 'bg-[#0A66C2]',
    twitter: 'bg-black',
    email: 'bg-brand-600',
    producthunt: 'bg-[#FF6154]',
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />

      <PageContainer withSidebar maxWidth="wide">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/launch/checklist"
            className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Checklist
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-coral flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-display-sm text-charcoal">Announcement Templates</h1>
              <p className="text-charcoal/60">Copy-Paste Vorlagen für deinen Launch</p>
            </div>
          </div>
        </motion.div>

        {/* Templates */}
        <div className="space-y-4 mb-12">
          {TEMPLATES.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl shadow-card border border-sand/50 overflow-hidden"
            >
              {/* Template Header */}
              <button
                onClick={() => setExpandedTemplate(
                  expandedTemplate === template.id ? null : template.id
                )}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-sand/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                    platformColors[template.platform]
                  )}>
                    {template.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-charcoal">{template.title}</h3>
                    <p className="text-xs text-charcoal/50">
                      {template.language === 'de' ? 'Deutsch' : 'English'}
                    </p>
                  </div>
                </div>
                {expandedTemplate === template.id ? (
                  <ChevronDown className="w-5 h-5 text-charcoal/40" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-charcoal/40" />
                )}
              </button>

              {/* Template Content */}
              {expandedTemplate === template.id && (
                <div className="px-6 pb-6 border-t border-sand/30">
                  {/* Content Area */}
                  <div className="mt-4 relative">
                    <pre className="bg-sand/30 rounded-xl p-4 text-sm text-charcoal whitespace-pre-wrap font-sans overflow-x-auto">
                      {template.content}
                    </pre>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => copyToClipboard(template.content, template.id)}
                      className="absolute top-3 right-3 gap-2"
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Kopiert!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Kopieren
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Tips */}
                  {template.tips && (
                    <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                      <h4 className="text-sm font-semibold text-brand-700 mb-2">Tipps:</h4>
                      <ul className="space-y-1">
                        {template.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-brand-600 flex items-start gap-2">
                            <span className="text-brand-400">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Post-Launch Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-brand-600" />
            Post-Launch Checklist
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POST_LAUNCH_CHECKLIST.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card border border-sand/50"
              >
                <h3 className="font-semibold text-charcoal mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-brand-600 to-coral rounded-2xl p-8 text-white text-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Viel Erfolg beim Launch!</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-4">
            Du hast etwas Großartiges gebaut. Jetzt ist es Zeit, es der Welt zu zeigen.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
            <span>Launch ist der Anfang, nicht das Ende</span>
            <span>•</span>
            <span>Feedback ist ein Geschenk</span>
            <span>•</span>
            <span>Iteration &gt; Perfektion</span>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
}

export default AnnouncementPage;
