/**
 * Launch Checklist Page
 * Interactive checklist for pre-launch verification
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Rocket,
  Code,
  Database,
  Server,
  Globe,
  Scale,
  TestTube,
  Headphones,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCheck,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  critical?: boolean;
}

interface ChecklistPhase {
  id: string;
  title: string;
  icon: React.ReactNode;
  timeEstimate: string;
  items: ChecklistItem[];
}

const LAUNCH_CHECKLIST: ChecklistPhase[] = [
  {
    id: 'code-build',
    title: 'Code & Build',
    icon: <Code className="w-5 h-5" />,
    timeEstimate: '30 min',
    items: [
      { id: 'npm-build', label: 'npm run build läuft ohne Errors', critical: true },
      { id: 'no-warnings', label: 'Build zeigt keine kritischen Warnings' },
      { id: 'typescript', label: 'TypeScript: Keine Type Errors', critical: true },
      { id: 'eslint', label: 'ESLint: Keine kritischen Warnings' },
      { id: 'features-merged', label: 'Alle Features sind in main gemerged', critical: true },
      { id: 'git-clean', label: 'Git Status ist clean (keine uncommitted changes)' },
    ],
  },
  {
    id: 'database',
    title: 'Datenbank',
    icon: <Database className="w-5 h-5" />,
    timeEstimate: '15 min',
    items: [
      { id: 'migrations', label: 'Alle Migrations sind auf Production deployed', critical: true },
      { id: 'rls', label: 'RLS ist auf ALLEN Tabellen aktiviert', critical: true },
      { id: 'seed-data', label: 'Seed Data ist vorhanden (Toolkit, etc.)' },
      { id: 'test-data-removed', label: 'Test-Daten sind entfernt' },
    ],
  },
  {
    id: 'edge-functions',
    title: 'Edge Functions',
    icon: <Server className="w-5 h-5" />,
    timeEstimate: '10 min',
    items: [
      { id: 'functions-deployed', label: 'Alle Edge Functions sind deployed', critical: true },
      { id: 'secrets-set', label: 'Secrets sind gesetzt (ANTHROPIC_API_KEY, etc.)', critical: true },
      { id: 'functions-tested', label: 'Functions wurden getestet (Chat, Dokumente)' },
    ],
  },
  {
    id: 'hosting',
    title: 'Hosting / Vercel',
    icon: <Globe className="w-5 h-5" />,
    timeEstimate: '15 min',
    items: [
      { id: 'deployment-current', label: 'Production Deployment ist aktuell', critical: true },
      { id: 'env-vars', label: 'Environment Variables sind gesetzt', critical: true },
      { id: 'custom-domain', label: 'Custom Domain verbunden (optional)' },
      { id: 'analytics', label: 'Analytics aktiviert (optional)' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal (KRITISCH für DE)',
    icon: <Scale className="w-5 h-5" />,
    timeEstimate: '10 min',
    items: [
      { id: 'impressum-name', label: 'Impressum: Vollständiger Name / Firmenname', critical: true },
      { id: 'impressum-address', label: 'Impressum: Vollständige Adresse', critical: true },
      { id: 'impressum-contact', label: 'Impressum: Telefon & E-Mail', critical: true },
      { id: 'impressum-legal', label: 'Impressum: Geschäftsführer/HRB (falls zutreffend)' },
      { id: 'datenschutz-complete', label: 'Datenschutzerklärung ist vollständig', critical: true },
      { id: 'datenschutz-services', label: 'Alle Services erwähnt (Supabase, Vercel, Claude)', critical: true },
      { id: 'footer-links', label: 'Footer-Links funktionieren (/impressum, /datenschutz)' },
    ],
  },
  {
    id: 'testing',
    title: 'Funktionstest',
    icon: <TestTube className="w-5 h-5" />,
    timeEstimate: '30 min',
    items: [
      { id: 'new-user-journey', label: 'Scenario 1: Neuer User Journey getestet', critical: true },
      { id: 'multi-session', label: 'Scenario 2: Multi-Session Test' },
      { id: 'multi-venture', label: 'Scenario 3: Multi-Venture Test' },
      { id: 'legal-pages-test', label: 'Scenario 8: Legal Pages funktionieren' },
      { id: 'mobile-test', label: 'Mobile getestet (Navigation, Chat, Layout)' },
      { id: 'console-clean', label: 'Console ist clean (keine roten Errors)', critical: true },
    ],
  },
  {
    id: 'support',
    title: 'Support & Monitoring',
    icon: <Headphones className="w-5 h-5" />,
    timeEstimate: '10 min',
    items: [
      { id: 'support-email', label: 'Support-Email eingerichtet' },
      { id: 'feedback', label: 'Feedback-Möglichkeit vorhanden' },
      { id: 'error-tracking', label: 'Error Tracking (Sentry) optional aber empfohlen' },
    ],
  },
  {
    id: 'launch-assets',
    title: 'Launch Assets',
    icon: <FileText className="w-5 h-5" />,
    timeEstimate: '20 min',
    items: [
      { id: 'announcement', label: 'Launch Announcement geschrieben' },
      { id: 'screenshots', label: 'Screenshots/Demo vorbereitet (3-5 Hauptfeatures)' },
      { id: 'target-audience', label: 'Zielgruppe definiert (LinkedIn, Twitter, Communities)' },
    ],
  },
];

const FINAL_CHECKLIST: ChecklistItem[] = [
  { id: 'all-above', label: 'Alle obigen Punkte sind abgehakt', critical: true },
  { id: 'self-tested', label: 'Ich habe selbst durch die App geklickt', critical: true },
  { id: 'friend-tested', label: 'Ein Freund/Kollege hat getestet' },
  { id: 'ready-feedback', label: 'Ich bin bereit für Feedback (positiv UND negativ)' },
  { id: 'rollback-plan', label: 'Ich habe einen Rollback-Plan (Vercel: Previous Deployment)' },
];

export function LaunchChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(LAUNCH_CHECKLIST.map(p => p.id)));

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('launchos-launch-checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCheckedItems(new Set(parsed));
      } catch (e) {
        console.error('Error loading checklist state:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('launchos-launch-checklist', JSON.stringify([...checkedItems]));
  }, [checkedItems]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const resetChecklist = () => {
    if (confirm('Möchtest du die Checklist wirklich zurücksetzen?')) {
      setCheckedItems(new Set());
    }
  };

  // Calculate progress
  const allItems = [
    ...LAUNCH_CHECKLIST.flatMap(p => p.items),
    ...FINAL_CHECKLIST,
  ];
  const criticalItems = allItems.filter(i => i.critical);
  const completedCount = allItems.filter(i => checkedItems.has(i.id)).length;
  const criticalCompletedCount = criticalItems.filter(i => checkedItems.has(i.id)).length;
  const progress = Math.round((completedCount / allItems.length) * 100);
  const criticalProgress = Math.round((criticalCompletedCount / criticalItems.length) * 100);

  const isReadyForLaunch = criticalItems.every(i => checkedItems.has(i.id));

  // Export checklist as text
  const exportChecklist = () => {
    let text = '# LaunchOS Launch Checklist\n\n';
    text += `Datum: ${new Date().toLocaleDateString('de-DE')}\n`;
    text += `Fortschritt: ${completedCount}/${allItems.length} (${progress}%)\n`;
    text += `Kritische Punkte: ${criticalCompletedCount}/${criticalItems.length}\n\n`;

    LAUNCH_CHECKLIST.forEach(phase => {
      text += `## ${phase.title}\n`;
      phase.items.forEach(item => {
        const checked = checkedItems.has(item.id) ? '[x]' : '[ ]';
        const critical = item.critical ? ' (KRITISCH)' : '';
        text += `${checked} ${item.label}${critical}\n`;
      });
      text += '\n';
    });

    text += '## Finale Checks\n';
    FINAL_CHECKLIST.forEach(item => {
      const checked = checkedItems.has(item.id) ? '[x]' : '[ ]';
      const critical = item.critical ? ' (KRITISCH)' : '';
      text += `${checked} ${item.label}${critical}\n`;
    });

    text += `\n## GO / NO-GO Entscheidung\n`;
    text += isReadyForLaunch ? '[x] GO - Alle kritischen Punkte abgehakt' : '[ ] NO-GO - Noch offene kritische Punkte';

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launch-checklist-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-coral flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-display-sm text-charcoal">Launch Checklist</h1>
                <p className="text-charcoal/60">Finale Überprüfung vor dem Go-Live</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={resetChecklist} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={exportChecklist} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {/* Total Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-sand/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-charcoal/60">Gesamtfortschritt</span>
              <span className="text-2xl font-bold text-charcoal">{progress}%</span>
            </div>
            <div className="h-2 bg-sand/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-charcoal/50 mt-2">
              {completedCount} von {allItems.length} Punkten
            </p>
          </div>

          {/* Critical Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-sand/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-charcoal/60">Kritische Punkte</span>
              <span className={cn(
                "text-2xl font-bold",
                criticalProgress === 100 ? "text-sage" : "text-coral"
              )}>
                {criticalProgress}%
              </span>
            </div>
            <div className="h-2 bg-sand/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  criticalProgress === 100 ? "bg-sage" : "bg-coral"
                )}
                style={{ width: `${criticalProgress}%` }}
              />
            </div>
            <p className="text-xs text-charcoal/50 mt-2">
              {criticalCompletedCount} von {criticalItems.length} kritischen
            </p>
          </div>

          {/* Launch Status */}
          <div className={cn(
            "rounded-2xl p-6 shadow-card border",
            isReadyForLaunch
              ? "bg-sage/10 border-sage/30"
              : "bg-coral/10 border-coral/30"
          )}>
            <div className="flex items-center gap-3 mb-2">
              {isReadyForLaunch ? (
                <CheckCheck className="w-6 h-6 text-sage" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-coral" />
              )}
              <span className={cn(
                "text-lg font-bold",
                isReadyForLaunch ? "text-sage" : "text-coral"
              )}>
                {isReadyForLaunch ? 'GO' : 'NO-GO'}
              </span>
            </div>
            <p className={cn(
              "text-sm",
              isReadyForLaunch ? "text-sage/80" : "text-coral/80"
            )}>
              {isReadyForLaunch
                ? 'Alle kritischen Punkte erfüllt!'
                : `Noch ${criticalItems.length - criticalCompletedCount} kritische Punkte offen`}
            </p>
          </div>
        </motion.div>

        {/* Checklist Phases */}
        <div className="space-y-4 mb-8">
          {LAUNCH_CHECKLIST.map((phase, index) => {
            const phaseItems = phase.items;
            const completedPhaseItems = phaseItems.filter(i => checkedItems.has(i.id)).length;
            const isExpanded = expandedPhases.has(phase.id);
            const phaseComplete = completedPhaseItems === phaseItems.length;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={cn(
                  "bg-white rounded-2xl shadow-card border overflow-hidden",
                  phaseComplete ? "border-sage/30" : "border-sand/50"
                )}
              >
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-sand/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      phaseComplete ? "bg-sage/20 text-sage" : "bg-brand-100 text-brand-600"
                    )}>
                      {phase.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-charcoal">{phase.title}</h3>
                      <p className="text-xs text-charcoal/50">
                        {completedPhaseItems}/{phaseItems.length} erledigt · ca. {phase.timeEstimate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {phaseComplete && (
                      <span className="px-2 py-1 bg-sage/10 text-sage text-xs font-medium rounded-full">
                        Komplett
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-charcoal/40" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-charcoal/40" />
                    )}
                  </div>
                </button>

                {/* Phase Items */}
                {isExpanded && (
                  <div className="px-6 pb-4 pt-2 border-t border-sand/30">
                    <div className="space-y-2">
                      {phaseItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
                            checkedItems.has(item.id)
                              ? "bg-sage/10"
                              : "hover:bg-sand/30"
                          )}
                        >
                          {checkedItems.has(item.id) ? (
                            <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-charcoal/30 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className={cn(
                              "text-sm",
                              checkedItems.has(item.id)
                                ? "text-charcoal/60 line-through"
                                : "text-charcoal"
                            )}>
                              {item.label}
                            </span>
                            {item.critical && !checkedItems.has(item.id) && (
                              <span className="ml-2 px-1.5 py-0.5 bg-coral/10 text-coral text-xs font-medium rounded">
                                KRITISCH
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Final Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-brand-600 to-coral rounded-2xl p-6 text-white mb-8"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCheck className="w-5 h-5" />
            Finale Checks
          </h3>
          <div className="space-y-2">
            {FINAL_CHECKLIST.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                  checkedItems.has(item.id)
                    ? "bg-white/20"
                    : "bg-white/10 hover:bg-white/15"
                )}
              >
                {checkedItems.has(item.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-white/50 flex-shrink-0" />
                )}
                <span className={cn(
                  "text-sm",
                  checkedItems.has(item.id) ? "line-through opacity-70" : ""
                )}>
                  {item.label}
                </span>
                {item.critical && !checkedItems.has(item.id) && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 text-xs font-medium rounded">
                    KRITISCH
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* GO / NO-GO Decision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            "rounded-2xl p-8 text-center",
            isReadyForLaunch
              ? "bg-sage/10 border-2 border-sage"
              : "bg-coral/10 border-2 border-coral/30"
          )}
        >
          {isReadyForLaunch ? (
            <>
              <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-10 h-10 text-sage" />
              </div>
              <h2 className="text-2xl font-bold text-sage mb-2">Bereit für den Launch!</h2>
              <p className="text-sage/80 mb-6">
                Alle kritischen Punkte sind abgehakt. Du kannst jetzt launchen!
              </p>
              <a
                href="/launch/announcement"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sage text-white font-semibold rounded-xl hover:bg-sage/90 transition-colors"
              >
                Zu den Announcement Templates
                <ChevronRight className="w-4 h-4" />
              </a>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-coral" />
              </div>
              <h2 className="text-2xl font-bold text-coral mb-2">Noch nicht bereit</h2>
              <p className="text-coral/80">
                Es sind noch {criticalItems.length - criticalCompletedCount} kritische Punkte offen.
                Bitte prüfe alle Punkte vor dem Launch.
              </p>
            </>
          )}
        </motion.div>
      </PageContainer>
    </div>
  );
}

export default LaunchChecklistPage;
