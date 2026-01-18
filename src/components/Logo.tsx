interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// LaunchOS Logo Icon - Rakete mit geschwungenem Schweif (exakt wie im Branding)
const LogoIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Geschwungener Schweif */}
    <path
      d="M3.5 20.5C3.5 20.5 6 18 8.5 15.5C11 13 13.5 11 13.5 11"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Raketen-Körper */}
    <path
      d="M13 11C13 11 14.5 9.5 16.5 7.5C18.5 5.5 20 4 20 4C20 4 20.5 6 19.5 8.5C18.5 11 16 14 13 17C10 20 7 21.5 7 21.5C7 21.5 8 19 9.5 16.5C11 14 13 11 13 11Z"
      fill="white"
    />
    {/* Flügel links */}
    <path
      d="M7 14C7 14 5 15.5 4 17C5.5 16 7 14 7 14Z"
      fill="white"
    />
    {/* Flügel unten */}
    <path
      d="M10 17C10 17 8.5 19 7 20C8 18.5 10 17 10 17Z"
      fill="white"
    />
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
