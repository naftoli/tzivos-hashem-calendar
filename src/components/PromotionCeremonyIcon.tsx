import React from 'react';

interface PromotionCeremonyIconProps {
  size?: number;
  className?: string;
}

export const PromotionCeremonyIcon: React.FC<PromotionCeremonyIconProps> = ({
  size = 16,
  className = '',
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}>
<g transform="translate(-7.46, 10.73) scale(0.2317)">
    <path fill="rgb(236,49,99)" stroke="rgb(236,49,99)" strokeWidth="1" opacity="1" d="M 168.5 40 L 329.5 40 L 330.5 41 L 332 41 L 332 41.5 L 332 69.5 Q 332.25 70.25 331.5 70 L 165.5 70 L 165 70 Q 165 69.25 165 66.5 L 164 65.5 L 164 54.5 L 165 53.5 L 165 41.5 L 165 41 Q 165.5 41 167.5 41 L 168.5 40 Z "/>
    <path fill="rgb(65,83,134)" stroke="rgb(65,83,134)" strokeWidth="1" opacity="1" d="M 165 86 L 165.5 86 L 331.5 86 L 332 86 L 332 86.5 L 332 298.5 L 331.5 299 L 330.5 298 L 329.5 298 L 328 296.5 L 328 295.5 L 318.5 286 L 317.5 286 L 314.5 283 L 313.5 283 L 308.5 278 L 307.5 278 L 302 272.5 L 302 271 L 300 271 L 300 269.5 L 298.5 268 L 297.5 268 L 291.5 262 L 290.5 262 L 286.5 258 L 285.5 258 L 268.5 241 L 267.5 241 L 263.5 237 L 262.5 237 L 249.5 224 L 247.5 224 L 243.5 228 L 242.5 228 L 240.5 230 L 239.5 230 L 233.5 236 L 232 236 L 232 238 L 230 238 L 230 239.5 L 222.5 247 L 221.5 247 L 216.5 252 L 215.5 252 L 212.5 255 L 211.5 255 L 193.5 273 L 192.5 273 L 189.5 276 L 188.5 276 L 170.5 294 L 169.5 294 L 167.5 296 Q 165.75 295.75 165.5 297 L 164 295.5 L 165 294.5 L 165 86.5 L 165 86 Z "/>
  </g>
</svg>

  );
};
