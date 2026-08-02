import React from 'react';

interface EverglowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
}

export const EverglowLogo: React.FC<EverglowLogoProps> = ({
  className = '',
  size = 'md',
  showSubtext = true
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  }[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center text-center ${className}`}>
      {/* Official Circular Crown Emblem */}
      <div className={`relative ${dimensions} rounded-full bg-gradient-to-b from-[#FFF1F5] via-white to-[#FFE4EC] border-2 border-[#D4AF37] p-1 shadow-md flex items-center justify-center overflow-hidden shrink-0`}>
        {/* Outer Ring Gold Glow */}
        <div className="absolute inset-0.5 rounded-full border border-[#C5A059]/40 pointer-events-none"></div>

        {/* SVG Rendered Crown & EG Monogram */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCE36D" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B6508" />
            </linearGradient>
            <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7597" />
              <stop offset="100%" stopColor="#C2185B" />
            </linearGradient>
          </defs>

          {/* Golden Crown */}
          <path
            d="M 32 26 L 40 34 L 50 20 L 60 34 L 68 26 L 64 40 L 36 40 Z"
            fill="url(#goldGrad)"
          />
          <circle cx="50" cy="22" r="2" fill="#E91E63" />
          <circle cx="33" cy="27" r="1.5" fill="#FFF" />
          <circle cx="67" cy="27" r="1.5" fill="#FFF" />

          {/* EG Letters */}
          <text
            x="36"
            y="70"
            fontFamily="Playfair Display, serif"
            fontSize="42"
            fontWeight="bold"
            fill="url(#pinkGrad)"
            fontStyle="italic"
          >
            E
          </text>
          <text
            x="50"
            y="72"
            fontFamily="Playfair Display, serif"
            fontSize="44"
            fontWeight="bold"
            fill="url(#goldGrad)"
          >
            G
          </text>

          {/* Sparkles */}
          <circle cx="28" cy="48" r="1.5" fill="#D4AF37" />
          <circle cx="75" cy="45" r="1.5" fill="#FF7597" />
        </svg>
      </div>

      {showSubtext && (
        <div className="mt-1.5">
          <h2 className="font-brand-serif font-bold text-slate-900 tracking-tight text-sm uppercase">
            Everglow <span className="text-[#8B6508]">Community</span>
          </h2>
          <p className="text-[9px] font-medium italic text-slate-500">
            "Beauty in Every Glow, Clean in Every Home."
          </p>
        </div>
      )}
    </div>
  );
};
