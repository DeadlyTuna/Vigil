'use client';

import React from 'react';
import { useSim } from '../../lib/sim/simulator';

export function HealthCard() {
  const { snap } = useSim();
  
  if (!snap) return null;
  
  const hi = snap.hi || 100;
  const rul = snap.rul || 0;
  const prediction = snap.prediction || '';
  
  // Circular gauge for HI
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (hi / 100) * circumference;
  
  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center relative border border-white/10 glow-cyan">
      <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest absolute top-4 left-4">Health Index</h3>
      
      <div className="relative flex items-center justify-center mt-6 w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="50%" cy="50%" r={radius} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="12" 
          />
          <circle 
            cx="50%" cy="50%" r={radius} 
            fill="transparent" 
            stroke="var(--cyan)" 
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 0 6px var(--cyan))' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-5xl font-bold text-white tracking-tighter">{hi.toFixed(0)}</span>
          <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Score</span>
        </div>
      </div>
      
      {prediction && (
        <div className="mt-4 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
          {prediction}
        </div>
      )}
      
      <div className="w-full mt-6 flex justify-between items-end border-t border-white/5 pt-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase">Est. RUL</span>
          <span className="font-mono text-xl text-emerald-400">{rul} cycles</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-xs text-gray-500 uppercase">Trend</span>
          <span className="font-mono text-xl text-white">-1.2%</span>
        </div>
      </div>
    </div>
  );
}
