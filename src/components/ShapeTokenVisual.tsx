import React from 'react';
import type { ShapeKind, TokenColor } from '../types/game';

const COLOR_HEX: Record<TokenColor, { fill: string; stroke: string; softBg: string }> = {
  coral: { fill: '#FF7A59', stroke: '#EA580C', softBg: '#FFF1EB' },
  sky: { fill: '#38BDF8', stroke: '#0284C7', softBg: '#EFF8FF' },
  mint: { fill: '#34D399', stroke: '#059669', softBg: '#ECFDF5' },
  sunny: { fill: '#FBBF24', stroke: '#D97706', softBg: '#FEFCE8' },
  lavender: { fill: '#A78BFA', stroke: '#7C3AED', softBg: '#F5F3FF' },
  peach: { fill: '#FDBA74', stroke: '#EA580C', softBg: '#FFF7ED' },
  berry: { fill: '#F472B6', stroke: '#DB2777', softBg: '#FDF2F8' },
};

export function getTokenPalette(color: TokenColor) {
  return COLOR_HEX[color] ?? COLOR_HEX.coral;
}

interface ShapeTokenVisualProps {
  shape: ShapeKind;
  color: TokenColor;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  shadowOnly?: boolean;
  outlineOnly?: boolean;
  className?: string;
}

export const ShapeTokenVisual: React.FC<ShapeTokenVisualProps> = ({
  shape,
  color,
  emoji,
  size = 'md',
  shadowOnly = false,
  outlineOnly = false,
  className = '',
}) => {
  const palette = getTokenPalette(color);
  const px = size === 'sm' ? 40 : size === 'lg' ? 76 : 56;
  const fill = shadowOnly ? '#334155' : outlineOnly ? 'transparent' : palette.fill;
  const stroke = shadowOnly ? '#1E293B' : palette.stroke;
  const strokeDash = outlineOnly ? '6 5' : undefined;

  if (emoji && !shadowOnly && !outlineOnly) {
    return (
      <span
        className={`inline-flex items-center justify-center select-none leading-none ${className}`}
        style={{
          fontSize: size === 'sm' ? '1.75rem' : size === 'lg' ? '3.1rem' : '2.35rem',
        }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      className={`shrink-0 drop-shadow-sm ${className}`}
      aria-hidden="true"
    >
      {shape === 'circle' && (
        <circle cx="32" cy="32" r="24" fill={fill} stroke={stroke} strokeWidth="4" strokeDasharray={strokeDash} />
      )}
      {shape === 'square' && (
        <rect x="10" y="10" width="44" height="44" rx="10" fill={fill} stroke={stroke} strokeWidth="4" strokeDasharray={strokeDash} />
      )}
      {shape === 'triangle' && (
        <path
          d="M32 9L56 52H8L32 9Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
        />
      )}
      {shape === 'star' && (
        <path
          d="M32 6L39.5 22.5L57.5 24.8L44.2 37.2L47.8 55L32 46.2L16.2 55L19.8 37.2L6.5 24.8L24.5 22.5L32 6Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
        />
      )}
      {shape === 'heart' && (
        <path
          d="M32 54C32 54 9 39 9 23C9 15 15.5 9.5 22.5 9.5C27 9.5 30.2 12 32 15C33.8 12 37 9.5 41.5 9.5C48.5 9.5 55 15 55 23C55 39 32 54 32 54Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
        />
      )}
      {shape === 'hexagon' && (
        <path
          d="M32 7L54 19.5V44.5L32 57L10 44.5V19.5L32 7Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
        />
      )}
      {shape === 'diamond' && (
        <path
          d="M32 6L55 32L32 58L9 32L32 6Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
        />
      )}
      {shape === 'crescent' && (
        <path
          d="M40 10C26.5 11 16 21.8 16 34.8C16 47.2 26 56.5 39.5 56.5C44.8 56.5 49.5 54.8 53 51.8C42.5 51 35 43.8 35 33.8C35 23.2 42 15.2 51.5 13C48 11 44.2 9.8 40 10Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
        />
      )}
    </svg>
  );
};
