import React, { useState, useEffect } from 'react';
import { BrandStorage } from '../../services/brandStorage';

interface MyDocAnizerBannerProps {
  variant?: 'desktop' | 'mobile' | 'android';
  height?: number | string;
  className?: string;
  showSubtitle?: boolean;
}

export const MyDocAnizerBanner: React.FC<MyDocAnizerBannerProps> = ({
  variant = 'desktop',
  height = 44,
  className = '',
  showSubtitle = false
}) => {
  const isMobile = variant === 'mobile' || variant === 'android';
  const [customBanner, setCustomBanner] = useState<string | null>(() => 
    BrandStorage.getBanner(isMobile ? 'android' : 'desktop')
  );

  useEffect(() => {
    const handleUpdate = () => {
      setCustomBanner(BrandStorage.getBanner(isMobile ? 'android' : 'desktop'));
    };
    window.addEventListener('mydocanizer_brand_updated', handleUpdate);
    return () => window.removeEventListener('mydocanizer_brand_updated', handleUpdate);
  }, [isMobile]);

  // 1:1 Original-Grafikdatei im PNG-Format aus GitHub Repo Assets
  const officialSrc = isMobile 
    ? '/myDocAnizer-Mobile.png' 
    : '/myDocAnizer-Desktop.png';

  const bannerSrc = customBanner || officialSrc;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={bannerSrc}
        alt={`myDocAnizer ${variant} Banner`}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="w-auto max-w-full object-contain pointer-events-none drop-shadow-sm"
        loading="eager"
      />
      {showSubtitle && (
        <span className="text-[10px] text-cyan-300 font-mono tracking-tight bg-slate-900/90 border border-cyan-500/30 px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
          {isMobile ? 'Mobile Companion' : 'Desktop App'}
        </span>
      )}
    </div>
  );
};
