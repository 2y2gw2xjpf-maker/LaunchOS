#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// LaunchOS Sitemap Generator
// Run with: npx tsx scripts/generate-sitemap.ts
// ═══════════════════════════════════════════════════════════════════════════

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.SITE_URL || 'https://launchos.io';

interface SitemapPage {
  url: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const staticPages: SitemapPage[] = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/pricing', priority: 0.9, changefreq: 'weekly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/valuation', priority: 0.8, changefreq: 'weekly' },
  { url: '/whats-next', priority: 0.8, changefreq: 'weekly' },
  // Login/Auth pages are noindex, so not included
];

function generateSitemap(): void {
  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

  console.log('✅ Sitemap generated successfully!');
  console.log(`   Location: public/sitemap.xml`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Pages: ${staticPages.length}`);
}

function generateRobotsTxt(): void {
  const robotsTxt = `# LaunchOS Robots.txt
User-agent: *
Allow: /

# Disallow auth and app routes from indexing
Disallow: /auth/
Disallow: /app/
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  const publicDir = path.join(process.cwd(), 'public');

  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

  console.log('✅ robots.txt generated successfully!');
}

// Run generators
generateSitemap();
generateRobotsTxt();
