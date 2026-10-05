'use client';

import React, { useEffect, useState } from 'react';

export interface GaugeRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  unit: string;
  decimals?: number;
}

export function GaugeRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  unit,
  decimals = 0,
}: GaugeRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 270 degrees is 75% of a full circle
  const arcLength = circumference * 0.75;
  const emptyOffset = circumference - arcLength;
  
  // Clamped value
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? clampedValue / max : 0;
  
  const fillOffset = mounted 
    ? circumference - (arcLength * percent) 
    : circumference; // Start empty for animation

  // Value formatting
  const displayValue = mounted ? value.toFixed(decimals) : '0';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id={`glow-${label.replace(/\s+/g, '-')}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={emptyOffset}
          transform={`rotate(135 ${center} ${center})`}
        />

        {/* Foreground Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={fillOffset}
          transform={`rotate(135 ${center} ${center})`}
          filter={`url(#glow-${label.replace(/\s+/g, '-')})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center text-center mt-2">
        <div className="font-mono text-xl font-medium tracking-tight" style={{ color: '#fff' }}>
          {displayValue}
          <span className="text-xs ml-1 opacity-70">{unit}</span>
        </div>
        <div className="text-xs uppercase tracking-wider mt-1 opacity-60" style={{ color: '#fff' }}>
          {label}
        </div>
      </div>
    </div>
  );
}
