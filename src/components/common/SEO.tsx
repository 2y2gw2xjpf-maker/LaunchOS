import * as React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// SEO Component
// Manages document head meta tags for SEO and social sharing
// Uses native React for React 19 compatibility (no external Helmet deps)
// ═══════════════════════════════════════════════════════════════════════════

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
}

const DEFAULT_TITLE = 'LaunchOS - Das Pre-Funding Operating System für Gründer';
const DEFAULT_DESCRIPTION =
  'Bewerte dein Startup, finde die richtige Strategie und plane deinen Launch. AI-powered Tools für Gründer in der Pre-Funding Phase.';
const DEFAULT_IMAGE = '/og-image.png';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://launchos.io';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  keywords = ['startup', 'bewertung', 'valuation', 'gründer', 'funding', 'pre-seed'],
}: SEOProps) {
  const fullTitle = title ? `${title} | LaunchOS` : DEFAULT_TITLE;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  React.useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Basic Meta
    setMeta('description', description);
    setMeta('keywords', keywords.join(', '));

    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', fullImage, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', 'LaunchOS', true);
    setMeta('og:locale', 'de_DE', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', fullImage);

    // Additional
    setLink('canonical', fullUrl);
    setMeta('theme-color', '#8B5CF6');

    // Cleanup function - not strictly necessary for meta tags
    // but good practice
    return () => {
      // Meta tags persist intentionally between navigations
    };
  }, [fullTitle, description, fullImage, fullUrl, type, noindex, keywords]);

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Page-specific SEO presets
// ═══════════════════════════════════════════════════════════════════════════

export const PageSEO = {
  Landing: () => (
    <SEO
      description="LaunchOS hilft Gründern in der Pre-Funding Phase ihr Startup zu bewerten, die richtige Strategie zu finden und den Launch zu planen."
      keywords={['startup', 'gründer', 'pre-funding', 'bewertung', 'valuation', 'seed']}
    />
  ),

  Pricing: () => (
    <SEO
      title="Preise"
      description="Flexible Pläne für jede Phase deines Startups. Starte kostenlos und upgrade wenn du bereit bist."
      url="/pricing"
      keywords={['preise', 'startup tools', 'saas', 'subscription']}
    />
  ),

  Login: () => (
    <SEO
      title="Anmelden"
      description="Melde dich bei LaunchOS an und setze deine Startup-Reise fort."
      url="/login"
      noindex
    />
  ),

  Valuation: () => (
    <SEO
      title="Startup Bewertung"
      description="Berechne die Bewertung deines Startups mit bewährten Methoden wie Berkus, Scorecard und DCF."
      url="/valuation"
      keywords={['startup bewertung', 'valuation', 'berkus', 'scorecard', 'dcf']}
    />
  ),

  WhatsNext: () => (
    <SEO
      title="What's Next"
      description="Finde heraus welche Route für dein Startup am besten geeignet ist und erhalte einen personalisierten Action Plan."
      url="/whats-next"
      keywords={['startup strategie', 'action plan', 'roadmap', 'route']}
    />
  ),

  Settings: () => (
    <SEO
      title="Einstellungen"
      description="Verwalte dein LaunchOS Konto und deine Präferenzen."
      url="/app/settings"
      noindex
    />
  ),

  Compare: () => (
    <SEO
      title="Szenario Vergleich"
      description="Vergleiche verschiedene Strategien und Szenarien für dein Startup."
      url="/compare"
      keywords={['vergleich', 'szenario', 'strategie']}
    />
  ),
};
