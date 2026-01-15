import * as React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Github, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { name: 'Was tun?', href: '/whats-next' },
      { name: 'Bewertung', href: '/valuation' },
      { name: 'Methodik', href: '/about/methodology' },
    ],
    legal: [
      { name: 'Datenschutz', href: '/about/privacy' },
      { name: 'Impressum', href: '/about/imprint' },
    ],
  };

  return (
    <footer className={cn('bg-navy text-white', className)}>
      <div className="container-wide py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-gold" />
              </div>
              <span className="font-display font-bold text-xl">LaunchOS</span>
            </Link>
            <p className="text-white/60 max-w-md mb-6">
              Das Operating System fur Solo-Grunder. Finde heraus, was deine Idee wert ist
              und was du als nachstes tun solltest.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">Produkt</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            {currentYear} LaunchOS. Alle Berechnungen erfolgen lokal in deinem Browser.
          </p>
          <p className="text-white/40 text-sm">
            Made with{' '}
            <span className="text-gold" role="img" aria-label="love">
              love
            </span>{' '}
            fur Grunder
          </p>
        </div>
      </div>
    </footer>
  );
};
