import React from 'react';
import logoPng from '../assets/logo.png';

interface LogoProps {
  className?: string;
  size?: number;
  src?: string;
}

export const TzivosHashemLogo: React.FC<LogoProps> = ({
  className = 'w-9 h-9',
  size = 36,
  src,
}) => {
  const imageSrc = src || logoPng || '/logo.png';

  return (
    <img
      src={imageSrc}
      alt="Tzivos Hashem Logo"
      width={size}
      height={size}
      className={`${className} object-contain select-none`}
      referrerPolicy="no-referrer"
      loading="eager"
    />
  );
};
