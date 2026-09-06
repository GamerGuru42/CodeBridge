// src/components/common/CodeBridgeLogo.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface CodeBridgeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'dark-text' | 'light-text' | 'icon-only';
  showTagline?: boolean;
  href?: string | null;
  className?: string;
}

export default function CodeBridgeLogo({
  size = 'md',
  variant = 'dark-text',
  showTagline = true,
  href = '/',
  className = '',
}: CodeBridgeLogoProps) {
  const sizeMap: Record<string, { iconSize: number; titleSize: number; subtitleSize: number }> = {
    sm: { iconSize: 30, titleSize: 17, subtitleSize: 9 },
    md: { iconSize: 40, titleSize: 22, subtitleSize: 11 },
    lg: { iconSize: 52, titleSize: 28, subtitleSize: 14 },
    xl: { iconSize: 72, titleSize: 36, subtitleSize: 17 },
  };

  const currentScale = typeof size === 'number'
    ? { iconSize: size, titleSize: Math.round(size * 0.55), subtitleSize: Math.round(size * 0.28) }
    : sizeMap[size] || sizeMap.md;

  const isLightText = variant === 'light-text';
  const textColor = isLightText ? '#FFFFFF' : '#0B1B3D';
  const tagColor = isLightText ? '#94A3B8' : '#6B7280';

  // Unique gradient IDs
  const uniqueId = React.useId().replace(/[:]/g, '');
  const gradNavy = `cb-navy-${uniqueId}`;
  const gradLightBlue = `cb-light-${uniqueId}`;
  const gradMidBlue = `cb-mid-${uniqueId}`;

  /*
   * The CodeBridge monogram is a rounded-rectangle "CB" mark:
   *
   * ┌─────────────────┐
   * │  C (dark navy)   B upper (light cyan)  │
   * │       ═══white bridge═══               │
   * │  C (dark navy)   B lower (medium blue) │
   * └─────────────────┘
   *
   * The 'C' occupies the left ~55%, forming a thick rounded-square open on the right.
   * The 'B' has two separate lobes (upper and lower) on the right side.
   * A horizontal white bar (the "bridge") cuts through the middle.
   */

  const iconElement = (
    <svg
      width={currentScale.iconSize}
      height={currentScale.iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-label="CodeBridge Monogram"
    >
      <defs>
        {/* Dark navy gradient for the C shape */}
        <linearGradient id={gradNavy} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#062047" />
          <stop offset="50%" stopColor="#0A3272" />
          <stop offset="100%" stopColor="#164EA0" />
        </linearGradient>

        {/* Light sky-blue / cyan gradient for upper B lobe */}
        <linearGradient id={gradLightBlue} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>

        {/* Medium blue gradient for lower B lobe */}
        <linearGradient id={gradMidBlue} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/*
        === LAYER 1: The 'C' shape (dark navy) ===
        A thick U/C shape occupying the left portion.
        Rounded corners on top-left and bottom-left.
        Open on the right side where the B lobes connect.
      */}
      <path
        d={`
          M 22 5
          C 10 5, 5 12, 5 22
          L 5 78
          C 5 88, 10 95, 22 95
          L 55 95
          L 55 60
          L 28 60
          C 24 60, 22 58, 22 55
          L 22 45
          C 22 42, 24 40, 28 40
          L 55 40
          L 55 5
          Z
        `}
        fill={`url(#${gradNavy})`}
      />

      {/*
        === LAYER 2: Upper B lobe (light cyan) ===
        Rounded rectangle on the top-right.
      */}
      <path
        d={`
          M 55 5
          L 75 5
          C 88 5, 95 14, 95 25
          L 95 30
          C 95 38, 88 44, 78 44
          L 55 44
          L 55 40
          Z
        `}
        fill={`url(#${gradLightBlue})`}
      />

      {/*
        === LAYER 3: Lower B lobe (medium/darker blue) ===
        Rounded rectangle on the bottom-right.
      */}
      <path
        d={`
          M 55 56
          L 55 60
          L 80 60
          C 90 60, 95 65, 95 72
          L 95 78
          C 95 88, 88 95, 76 95
          L 55 95
          L 55 56
          Z
        `}
        fill={`url(#${gradMidBlue})`}
      />

      {/*
        === LAYER 4: White bridge / plug cutout ===
        A horizontal rounded bar across the center creating
        the iconic "bridge" negative space.
      */}
      <rect
        x="18"
        y="40"
        width="44"
        height="20"
        rx="6"
        ry="6"
        fill="white"
      />
    </svg>
  );

  const content = (
    <div
      className={`cb-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {iconElement}

      {variant !== 'icon-only' && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: `${currentScale.titleSize}px`,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: textColor,
              fontFamily: 'var(--cb-font-sans)',
            }}
          >
            CodeBridge
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: `${currentScale.subtitleSize}px`,
                fontWeight: 500,
                letterSpacing: '0em',
                color: tagColor,
                marginTop: '1px',
                fontFamily: 'var(--cb-font-sans)',
              }}
            >
              Ideas to Impact
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}>
        {content}
      </Link>
    );
  }

  return content;
}
