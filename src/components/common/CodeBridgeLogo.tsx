// src/components/common/CodeBridgeLogo.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface CodeBridgeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'dark-text' | 'light-text' | 'icon-only' | 'auto';
  showTagline?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export default function CodeBridgeLogo({
  size = 'md',
  variant = 'auto',
  showTagline = true,
  href = '/',
  className = '',
  priority = true,
}: CodeBridgeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dimensions map
  const isIconOnly = variant === 'icon-only';

  const sizeMap: Record<string, { height: number; width: number }> = {
    sm: isIconOnly
      ? { height: 28, width: 28 }
      : showTagline
      ? { height: 30, width: 113 }
      : { height: 24, width: 131 },
    md: isIconOnly
      ? { height: 38, width: 38 }
      : showTagline
      ? { height: 40, width: 151 }
      : { height: 32, width: 175 },
    lg: isIconOnly
      ? { height: 50, width: 50 }
      : showTagline
      ? { height: 52, width: 196 }
      : { height: 42, width: 230 },
    xl: isIconOnly
      ? { height: 68, width: 68 }
      : showTagline
      ? { height: 72, width: 271 }
      : { height: 56, width: 306 },
  };

  const dims = typeof size === 'number'
    ? isIconOnly
      ? { height: size, width: size }
      : showTagline
      ? { height: size, width: Math.round(size * 3.766) }
      : { height: size, width: Math.round(size * 5.47) }
    : sizeMap[size] || sizeMap.md;

  // Determine image source based on variant & tagline
  let src = '/images/codebridge-logo-full.png';
  let alt = 'CodeBridge — Ideas to Impact';
  
  let actualVariant = variant;
  if (variant === 'auto' && mounted) {
    actualVariant = resolvedTheme === 'dark' ? 'light-text' : 'dark-text';
  } else if (variant === 'auto' && !mounted) {
    actualVariant = 'dark-text'; // default before hydration
  }

  if (isIconOnly) {
    src = '/images/codebridge-icon.png';
    alt = 'CodeBridge Icon';
  } else if (actualVariant === 'light-text') {
    src = showTagline
      ? '/images/codebridge-logo-light.png'
      : '/images/codebridge-logo-notag-light.png';
    alt = 'CodeBridge';
  } else {
    src = showTagline
      ? '/images/codebridge-logo-full.png'
      : '/images/codebridge-logo-notag.png';
    alt = 'CodeBridge';
  }

  const logoImg = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={dims.width}
      height={dims.height}
      className={`cb-logo-img ${className}`}
      style={{
        height: `${dims.height}px`,
        width: 'auto',
        maxWidth: '100%',
        display: 'block',
        objectFit: 'contain',
      }}
      loading={priority ? 'eager' : 'lazy'}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
        }}
        aria-label="CodeBridge Home"
      >
        {logoImg}
      </Link>
    );
  }

  return logoImg;
}
