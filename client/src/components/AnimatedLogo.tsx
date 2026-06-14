import { useEffect, useState } from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  animate?: boolean;
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { logo: 40, text: 'text-lg' },
  md: { logo: 48, text: 'text-xl' },
  lg: { logo: 64, text: 'text-2xl' },
  xl: { logo: 96, text: 'text-3xl' },
  hero: { logo: 140, text: 'text-5xl' },
};

export default function AnimatedLogo({ 
  size = 'md', 
  animate = true, 
  showText = false,
  className = ''
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { logo: logoSize, text: textSize } = sizeMap[size];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`flex items-center gap-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Logo with orbital rings */}
      <div 
        className={`relative transition-all duration-700 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        style={{ width: logoSize, height: logoSize }}
      >
        {/* Outer rotating ring - copper */}
        {animate && (
          <div 
            className="absolute rounded-full animate-spin-slow"
            style={{
              inset: '-6px',
              border: '2px solid transparent',
              borderTopColor: '#b87333',
              borderRightColor: 'rgba(184, 115, 51, 0.3)',
            }}
          />
        )}
        
        {/* Inner rotating ring - silver (opposite direction) */}
        {animate && (
          <div 
            className="absolute rounded-full animate-spin-reverse"
            style={{
              inset: '-3px',
              border: '1px solid transparent',
              borderBottomColor: '#8b9dc3',
              borderLeftColor: 'rgba(139, 157, 195, 0.2)',
            }}
          />
        )}

        {/* Pulsing glow effect */}
        {animate && (
          <div 
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, rgba(184, 115, 51, 0.2) 0%, transparent 70%)',
              transform: 'scale(1.4)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Main logo image with subtle rotation */}
        <img 
          src="/manus-storage/logo_optimized_92a39fa3.png" 
          alt="RegulaSync"
          className="w-full h-full object-contain transition-all duration-500"
          style={{
            filter: isHovered 
              ? 'drop-shadow(0 0 20px rgba(184, 115, 51, 0.7))' 
              : 'drop-shadow(0 4px 12px rgba(184, 115, 51, 0.3))',
          }}
        />

        {/* Hover burst effect */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-150' : 'opacity-0 scale-100'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(184, 115, 51, 0.4) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Animated text */}
      {showText && (
        <div className={`font-bold ${textSize} transition-all duration-500 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <span className="text-navy">Regula</span>
          <span className="text-copper">Sync</span>
        </div>
      )}
    </div>
  );
}

// Splash screen version with the approved interlocking rings logo
export function AnimatedLogoSplash({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => {
        setPhase(4);
        onComplete?.();
      }, 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-1000 ${
      phase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}
    style={{
      background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 40%, #0f2847 100%)',
    }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Main animated logo with rotating outer ring */}
        <div className={`relative transition-all duration-1000 ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}>
          {/* Outer rotating ring */}
          <div 
            className="absolute inset-[-30px] rounded-full animate-spin-slow"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#b87333',
              borderRightColor: 'rgba(184, 115, 51, 0.4)',
            }}
          />
          
          {/* Second rotating ring (opposite direction) */}
          <div 
            className="absolute inset-[-50px] rounded-full animate-spin-reverse"
            style={{
              border: '1px solid transparent',
              borderBottomColor: '#8b9dc3',
              borderLeftColor: 'rgba(139, 157, 195, 0.3)',
            }}
          />
          
          {/* Third decorative ring */}
          <div 
            className="absolute inset-[-70px] rounded-full animate-spin-slower"
            style={{
              border: '1px dashed rgba(184, 115, 51, 0.2)',
            }}
          />

          {/* Main logo image */}
          <div className="relative">
            <img 
              src="/manus-storage/logo_optimized_92a39fa3.png" 
              alt="RegulaSync"
              className="w-36 h-36 object-contain animate-logo-float"
              style={{
                filter: 'drop-shadow(0 8px 32px rgba(184, 115, 51, 0.4))',
              }}
            />
            
            {/* Glow effect behind logo */}
            <div 
              className="absolute inset-0 animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, rgba(184, 115, 51, 0.3) 0%, transparent 60%)',
                filter: 'blur(20px)',
                transform: 'scale(1.5)',
                zIndex: -1,
              }}
            />
          </div>
        </div>

        {/* Text reveal */}
        <div className={`text-center transition-all duration-1000 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-5xl font-bold mb-2 tracking-tight">
            <span className="text-white">Regula</span>
            <span style={{ color: '#b87333' }}>Sync</span>
          </h1>
          <p className={`text-slate-400 text-lg tracking-wide transition-all duration-700 delay-300 ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}>
            AI-Powered Governance Automation
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`flex items-center gap-2 transition-all duration-700 ${
          phase >= 3 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full animate-bounce"
                style={{ 
                  backgroundColor: '#b87333',
                  animationDelay: `${i * 0.15}s` 
                }}
              />
            ))}
          </div>
          <span className="text-slate-500 text-sm ml-2">Loading demo...</span>
        </div>
      </div>

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? '#b87333' : i % 3 === 1 ? '#8b9dc3' : '#1e3a5f',
              opacity: 0.4,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
