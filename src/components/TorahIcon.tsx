import React from 'react';

interface TorahIconProps {
  size?: number | string;
  className?: string;
  color?: string; // main outline and roller color
  fillColor?: string; // parchment fill
}

export const TorahIcon: React.FC<TorahIconProps> = ({
  size = 14,
  className = '',
  color = '#15265c',
  fillColor = '#fef3c7',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Top and Bottom Wooden Handles (Atzei Chaim) - precisely centered in pillars */}
      <line x1="4.5" y1="1.5" x2="4.5" y2="5.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="4.5" y1="18.5" x2="4.5" y2="22.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="19.5" y1="1.5" x2="19.5" y2="5.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="19.5" y1="18.5" x2="19.5" y2="22.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />

      {/* Central Parchment Connecting Sheet */}
      <rect
        x="4.5"
        y="6"
        width="15"
        height="12"
        fill={fillColor}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Text Columns (Clean, bold lines) */}
      <path
        d="M8.5 9.5h2.5 M8.5 12h2.5 M8.5 14.5h2.5 M13 9.5h2.5 M13 12h2.5 M13 14.5h2.5"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Left Thick Parchment Roll / Pillar */}
      <rect
        x="2"
        y="5"
        width="5"
        height="14"
        rx="1.5"
        fill={fillColor}
        stroke={color}
        strokeWidth="1.6"
      />

      {/* Right Thick Parchment Roll / Pillar */}
      <rect
        x="17"
        y="5"
        width="5"
        height="14"
        rx="1.5"
        fill={fillColor}
        stroke={color}
        strokeWidth="1.6"
      />
    </svg>
  );
};

