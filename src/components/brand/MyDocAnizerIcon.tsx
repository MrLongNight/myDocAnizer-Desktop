import React, { useState, useEffect } from 'react';
import { BrandStorage } from '../../services/brandStorage';

interface MyDocAnizerIconProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
}

export const MyDocAnizerIcon: React.FC<MyDocAnizerIconProps> = ({
  className = '',
  size = 40,
  glow = true
}) => {
  const [customIcon, setCustomIcon] = useState<string | null>(() => BrandStorage.getIcon());

  useEffect(() => {
    const handleUpdate = () => {
      setCustomIcon(BrandStorage.getIcon());
    };
    window.addEventListener('mydocanizer_brand_updated', handleUpdate);
    return () => window.removeEventListener('mydocanizer_brand_updated', handleUpdate);
  }, []);

  const src = customIcon || '/myDocAnizer_Icon-Only.png';

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        glow ? 'drop-shadow-[0_0_10px_rgba(0,240,255,0.45)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="myDocAnizer Icon"
        className="w-full h-full object-contain pointer-events-none"
        loading="eager"
      />
    </div>
  );
};
