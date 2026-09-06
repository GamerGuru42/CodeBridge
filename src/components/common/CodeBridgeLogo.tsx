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
  // Dimension scales
  const sizeMap: Record<string, { iconWidth: number; iconHeight: number; titleSize: number; subtitleSize: number }> = {
    sm: { iconWidth: 32, iconHeight: 24, titleSize: 17, subtitleSize: 10 },
    md: { iconWidth: 42, iconHeight: 31, titleSize: 22, subtitleSize: 12 },
    lg: { iconWidth: 54, iconHeight: 40, titleSize: 28, subtitleSize: 14 },
    xl: { iconWidth: 72, iconHeight: 53, titleSize: 36, subtitleSize: 17 },
  };

  const currentScale = typeof size === 'number'
    ? { iconWidth: size, iconHeight: Math.round(size * 0.74), titleSize: Math.round(size * 0.52), subtitleSize: Math.round(size * 0.28) }
    : sizeMap[size] || sizeMap.md;

  const isLightText = variant === 'light-text';
  const textColor = isLightText ? '#FFFFFF' : '#0B1B3D';
  const tagColor = isLightText ? '#94A3B8' : '#475569';

  // Unique gradient IDs to prevent DOM conflicts when rendered multiple times
  const uniqueId = React.useId().replace(/[:]/g, '');
  const gradDarkBlue = `cb-grad-dark-${uniqueId}`;
  const gradCyan = `cb-grad-cyan-${uniqueId}`;
  const gradMidBlue = `cb-grad-mid-${uniqueId}`;

  const iconElement = (
    <svg
      width={currentScale.iconWidth}
      height={currentScale.iconHeight}
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-label="CodeBridge Monogram"
    >
      <defs>
        {/* Deep Navy/Royal Blue Gradient (Left 'C' arc) */}
        <linearGradient id={gradDarkBlue} x1="0%" y1="100%" x2="40%" y2="0%">
          <stop offset="0%" stopColor="#082046" />
          <stop offset="45%" stopColor="#0F3B7A" />
          <stop offset="100%" stopColor="#1E56B0" />
        </linearGradient>

        {/* Vibrant Azure/Cyan Gradient (Right 'B' outer curves) */}
        <linearGradient id={gradCyan} x1="30%" y1="10%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Mid-Tone Cyan/Blue Facet Gradient */}
        <linearGradient id={gradMidBlue} x1="20%" y1="20%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="60%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Drop shadow for subtle 3D depth */}
        <filter id={`cb-shadow-${uniqueId}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.12" />
        </filter>
      </defs>

      <g filter={`url(#cb-shadow-${uniqueId})`}>
        {/* Left 'C' Body: Outer thick rounded stadium curve */}
        <path
          d="M 50 10 
             C 24 10, 8 26, 8 45 
             C 8 64, 24 80, 50 80 
             L 52 80 
             C 42 70, 36 58, 36 45 
             C 36 32, 42 20, 52 10 
             Z"
          fill={`url(#${gradDarkBlue})`}
        />

        {/* Top-right 'B' Upper Lobe */}
        <path
          d="M 48 10 
             L 74 10 
             C 88 10, 98 19, 98 32 
             C 98 42, 91 48, 80 48 
             L 60 48 
             C 66 38, 66 22, 58 10 
             Z"
          fill={`url(#${gradMidBlue})`}
        />

        {/* Bottom-right 'B' Lower Lobe */}
        <path
          d="M 60 48 
             L 82 48 
             C 94 48, 102 56, 102 66 
             C 102 75, 92 80, 76 80 
             L 50 80 
             C 58 72, 60 58, 60 48 
             Z"
          fill={`url(#${gradCyan})`}
        />

        {/* Right Forward Loop Extension */}
        <path
          d="M 72 10 
             C 90 10, 104 22, 104 36 
             C 104 45, 98 50, 90 53 
             C 100 56, 106 63, 106 70 
             C 106 78, 96 80, 84 80 
             L 76 80 
             C 90 76, 96 68, 94 62 
             C 92 54, 82 50, 72 50 
             L 58 50 
             C 64 42, 64 26, 56 12 
             L 72 10 
             Z"
          fill={`url(#${gradCyan})`}
          opacity="0.92"
        />

        {/* Inner Bridge Negative Cutout / Plug Notch */}
        <path
          d="M 28 36 
             L 68 36 
             C 73 36, 76 40, 76 45 
             C 76 50, 73 54, 68 54 
             L 28 54 
             C 23 54, 20 50, 20 45 
             C 20 40, 23 36, 28 36 
             Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );

  const content = (
    <div
      className={`cb-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
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
              letterSpacing: '-0.035em',
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
                letterSpacing: '-0.01em',
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
