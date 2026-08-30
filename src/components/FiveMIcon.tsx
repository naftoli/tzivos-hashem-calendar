import React from 'react';

interface FiveMIconProps {
  size?: number | string;
  className?: string;
  color?: string;
}

export const FiveMIcon: React.FC<FiveMIconProps> = ({
  size = 18,
  className = '',
  color = '#d70a25',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="50 35 415 285"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* The '5' Character */}
      <path
        fill={color}
        stroke={color}
        strokeWidth="1"
        d="M 100.5 44 L 231.5 44 L 232 45.5 Q 239.99 57.01 239 77.5 Q 238.08 91.08 229.5 97 L 220.5 101 L 134.5 101 L 133 102.5 L 130 140 Q 148.67 133.98 175.5 135 Q 214.99 138.51 234 162.5 Q 253.83 185.17 251 230.5 Q 245.61 266.11 222.5 284 Q 191.39 310.89 128.5 306 Q 88.27 303.73 68 281.5 Q 58.93 273.07 61 253.5 Q 64.84 238.34 76.5 231 L 83.5 228 L 118.5 247 L 151.5 249 Q 166.1 247.1 173 237.5 Q 179.38 230.37 179 216.5 Q 177.66 203.34 169.5 197 Q 158.69 188.31 136.5 191 L 109.5 201 Q 83.63 199.87 72 184.5 Q 62.44 171.56 65 146.5 L 71 75.5 Q 74.05 60.55 83.5 52 L 100.5 44 Z"
      />

      {/* Golden Accents on the '5' */}
      <path
        fill="#fed032"
        stroke="#fed032"
        strokeWidth="1"
        d="M 107.5 43 L 231 43.5 L 107.5 44 L 107.5 43 Z"
      />
      <path
        fill="#fed032"
        stroke="#fed032"
        strokeWidth="1"
        d="M 134.5 101 L 216 101.5 L 134.5 102 L 134.5 101 Z"
      />

      {/* The 'M' Character Base Outline */}
      <path
        fill={color}
        stroke={color}
        strokeWidth="1"
        d="M 374.5 105 Q 390.08 106.92 398 116.5 L 402 127.5 L 407.5 162 L 410 119.5 L 409 116.5 L 412.5 111 Q 425.11 105.11 445.5 107 L 453 111.5 L 454 116.5 L 431 232.5 L 424.5 249 L 402.5 251 L 396.5 248 L 379.5 246 L 373 240.5 L 370.5 235 L 363.5 246 L 347.5 249 L 339 245 L 332.5 230 Q 334.04 244.54 325.5 249 L 310.5 253 L 289 240.5 L 284 231.5 L 282 127.5 L 286.5 120 Q 298.73 110.73 318.5 109 Q 329.89 110.11 336 116.5 L 342.5 132 Q 343.2 119.2 350.5 113 L 374.5 105 Z M 426 113 L 418 115 L 416 117 Q 416 173 410 224 L 402 205 Q 386 205 378 213 Q 387 232 402 245 L 421 244 L 426 229 L 448 115 L 447 113 L 426 113 Z M 372 115 L 357 120 L 352 127 L 347 164 L 345 165 L 331 125 L 321 119 L 312 119 L 293 127 L 290 136 L 293 232 L 310 243 L 320 242 L 324 237 L 321 181 L 324 179 L 345 238 L 350 240 L 359 238 L 362 233 L 369 180 L 371 177 L 373 181 L 375 205 L 405 197 L 391 122 Q 385 115 372 115 Z"
      />

      {/* 'M' Golden Crown / Center Shape */}
      <path
        fill="#fed032"
        stroke="#fed032"
        strokeWidth="1"
        d="M 371.5 115 Q 384.83 114.67 391 121.5 L 405 196.5 L 375 205 L 373 180.5 L 370.5 177 L 369 179.5 L 362 232.5 L 358.5 238 L 349.5 240 L 345 237.5 L 323.5 179 L 321 180.5 L 324 236.5 L 319.5 242 L 309.5 243 L 293 231.5 L 290 135.5 L 292.5 127 L 311.5 119 L 320.5 119 L 331 124.5 L 344.5 165 L 347 163.5 L 352 126.5 L 356.5 120 L 371.5 115 Z"
      />

      {/* 'M' Shadow / Accent Wing */}
      <path
        fill="#9f071b"
        stroke="#9f071b"
        strokeWidth="1"
        d="M 427.5 113 L 447 114 L 428 217.5 L 420.5 244 L 404.5 245 L 398 241.5 L 378 212.5 Q 387.41 205.74 402 205 L 409 225 L 411 224.5 L 411 213.5 Q 417.18 167.65 416 116 L 427.5 113 Z"
      />
    </svg>
  );
};
