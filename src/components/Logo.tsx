import { Rocket } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg', padding: 'p-2' },
    md: { icon: 28, text: 'text-xl', padding: 'p-2.5' },
    lg: { icon: 36, text: 'text-2xl', padding: 'p-3' },
  };

  return (
    <div className="flex items-center gap-3">
      {/* Icon mit Gradient Background */}
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />

        {/* Icon Container */}
        <div className={`
          relative ${sizes[size].padding} rounded-xl
          bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500
          shadow-lg shadow-purple-500/30
        `}>
          <Rocket
            size={sizes[size].icon}
            className="text-white transform -rotate-45"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Text mit Gradient */}
      {showText && (
        <span className={`
          font-display font-bold ${sizes[size].text}
          bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent
        `}>
          LaunchOS
        </span>
      )}
    </div>
  );
}
