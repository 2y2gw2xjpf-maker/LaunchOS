interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// LaunchOS Logo Icon - Rakete mit Schweif
const LogoIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rakete */}
    <path
      d="M20.5 4C16.5 4 13.5 7 11 11C9 14 8 17 8 19C8 21 9 22 11 22C13 22 16 21 19 19C23 16.5 26 13.5 26 9.5C26 6.5 23.5 4 20.5 4Z"
      fill="white"
    />
    {/* Schweif/Flamme */}
    <path
      d="M6 26C6 26 7 23 9 21C10.5 19.5 12 19 12 19C12 19 11.5 20.5 10 22C8 24 6 26 6 26Z"
      fill="white"
      opacity="0.9"
    />
    <path
      d="M4 28C4 28 5.5 25 8 23C9.5 21.5 11 21 11 21C11 21 10 23 8 25C6 27 4 28 4 28Z"
      fill="white"
      opacity="0.7"
    />
    {/* Fenster */}
    <circle cx="18" cy="12" r="2.5" fill="#9333EA" />
  </svg>
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
