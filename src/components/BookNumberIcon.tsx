import React from 'react';

interface BookNumberIconProps {
  number: number;
  size?: number;
  className?: string;
  color?: string;
}

export const BookNumberIcon: React.FC<BookNumberIconProps> = ({
  number,
  size = 18,
  className = '',
  color = '#b48a18', // Chidon Gold
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`Book ${number}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Open Book Outline */}
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />

        {/* Larger Vector Centered Number */}
        <text
          x="12.2"
          y="10.5"
          fill={color}
          stroke="none"
          fontSize="14"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {number}
        </text>
      </svg>
    </div>
  );
};