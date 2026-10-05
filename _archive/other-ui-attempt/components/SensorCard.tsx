'use client';

import React, { ReactNode } from 'react';

interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  icon: ReactNode;
  color: string;
  trend: number[];
  thresholds: { ok: number; warn: number; crit: number };
  decimals?: number;
}

export function SensorCard({
  label,
  value,
  unit,
  icon,
  color,
  trend,
  thresholds,
  decimals = 2
}: SensorCardProps) {
  let level = 0; // 0=ok, 1=warn, 2=crit
  if (value > thresholds.warn) {
    level = value > thresholds.crit ? 2 : 1;
  }
  
  const glowClass = level === 2 ? 'glow-red' : level === 1 ? 'glow-amber' : 'glow-cyan';

  // sparkline path
  const min = Math.min(...trend, value);
  const max = Math.max(...trend, value);
  const range = max - min || 1;
  const points = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className={`sensor-card glass-panel flex flex-col gap-3 p-4 relative overflow-hidden rounded-xl border border-white/10 ${glowClass}`}>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span>{label}</span>
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <span className="font-mono text-3xl font-bold text-white tracking-wider">
          {value.toFixed(decimals)}
        </span>
        <span className="text-gray-500 mb-1">{unit}</span>
      </div>
      
      {/* Horizontal Bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full relative overflow-hidden mt-1">
        <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/30" style={{ width: `${(thresholds.ok / thresholds.crit) * 100}%` }} />
        <div className="absolute left-0 top-0 bottom-0 bg-amber-500/30" style={{ width: `${((thresholds.warn - thresholds.ok) / thresholds.crit) * 100}%`, left: `${(thresholds.ok / thresholds.crit) * 100}%` }} />
        <div className="absolute right-0 top-0 bottom-0 bg-red-500/30" style={{ width: `${(1 - thresholds.warn / thresholds.crit) * 100}%` }} />
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] transition-all duration-300 rounded-full"
          style={{ left: `${Math.min(100, (value / thresholds.crit) * 100)}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Sparkline */}
      <div className="h-10 w-full mt-2 opacity-50">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <path d={`M 0,100 L 0,${trend.length ? 100 - ((trend[0] - min) / range) * 100 : 100} L ${points} L 100,100 Z`} fill="url(#sparkGradient)" opacity="0.2" />
          <path d={`M 0,${trend.length ? 100 - ((trend[0] - min) / range) * 100 : 100} L ${points}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
