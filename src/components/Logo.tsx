import { Rocket } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// LaunchOS Logo Icon - Nutzt das Lucide Rocket Icon (wie im Footer)
const LogoIcon = ({ size = 28 }: { size?: number }) => (
  <Rocket
    size={size}
    className="text-white"
    strokeWidth={2}
  />
);

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, container: 'w-8 h-8', text: 'text-lg', radius: 'rounded-lg' },
    md: { icon: 24, container: 'w-10 h-10', text: 'text-xl', radius: 'rounded-xl' },
    lg: { icon: 32, container: 'w-12 h-12', text: 'text-2xl', radius: 'rounded-xl' },
  };

  return (
    <div className="flex items-center gap-3">
      {/* Icon mit Gradient Background */}
      <div className="relative group">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 ${sizes[size].radius} blur-lg opacity-40 group-hover:opacity-60 transition-opacity`} />

        {/* Icon Container */}
        <div className={`
          relative ${sizes[size].container} ${sizes[size].radius}
          bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500
          shadow-lg shadow-purple-500/30
          flex items-center justify-center
        `}>
          <LogoIcon size={sizes[size].icon} />
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

// Export für separate Verwendung
export { LogoIcon };
