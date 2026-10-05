'use client';

import React from 'react';
import { IndicatorDef } from '../../lib/sim/config';

interface IndicatorBarProps {
  def: IndicatorDef;
  value: number;
  level: 0 | 1 | 2;
}

export function IndicatorBar({ def, value, level }: IndicatorBarProps) {
  const { key, label, unit, min, max, thresholds } = def;
  
  // Calculate percentage for positioning marker
  const range = max - min;
  const percent = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  
  // Map thresholds to percentages
  const tOk = ((thresholds[0] - min) / range) * 100;
  const tWarn = ((thresholds[1] - min) / range) * 100;
  
  return (
    <div className="flex flex-col gap-1 w-full mb-3">
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-gray-300 tracking-wide">{label}</span>
        <span className="font-mono text-sm text-white">{value.toFixed(2)} <span className="text-gray-500 text-xs">{unit}</span></span>
      </div>
      
      <div className="h-1.5 w-full bg-gray-800 rounded-full relative mt-1 overflow-visible">
        {/* Track Zones */}
        <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 rounded-l-full" style={{ width: `${tOk}%` }} />
        <div className="absolute top-0 bottom-0 bg-amber-500/20" style={{ left: `${tOk}%`, width: `${tWarn - tOk}%` }} />
        <div className="absolute top-0 bottom-0 bg-red-500/20 rounded-r-full" style={{ left: `${tWarn}%`, right: 0 }} />
        
        {/* Marker */}
        <div 
          className="absolute top-1/2 w-2 h-3 bg-white shadow-[0_0_5px_white] transition-all duration-300"
          style={{ 
            left: `${percent}%`, 
            transform: 'translate(-50%, -50%)',
            borderRadius: '1px'
          }}
        />
      </div>
    </div>
  );
}
