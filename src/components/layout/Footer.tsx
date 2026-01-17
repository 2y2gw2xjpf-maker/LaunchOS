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
      { name: 'Datenschutz', href: '/datenschutz' },
      { name: 'Impressum', href: '/impressum' },
    ],
  };

  return (
    <footer className={cn('relative', className)}>
      {/* Gradient Banner Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 container-wide py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">LaunchOS</span>
            </Link>
            <p className="text-white/80 max-w-md mb-6">
              Das Operating System für Solo-Gründer. Finde heraus, was deine Idee wert ist
              und was du als nächstes tun solltest.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Github className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4 text-white">Produkt</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4 text-white">Rechtliches</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            {currentYear} LaunchOS. Alle Berechnungen erfolgen lokal in deinem Browser.
          </p>
          <p className="text-white/60 text-sm">
            Made with{' '}
            <span className="text-pink-300">❤️</span>{' '}
            für Gründer
          </p>
        </div>
      </div>
    </footer>
  );
};
