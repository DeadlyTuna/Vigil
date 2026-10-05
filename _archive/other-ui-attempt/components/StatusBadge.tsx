'use client';

import React from 'react';

export type BadgeState = 'OFF' | 'STARTUP' | 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'TRIPPED';

export interface StatusBadgeProps {
  state: BadgeState;
}

const stateConfig: Record<BadgeState, { color: string; dotColor: string; bgClass: string }> = {
  OFF: { color: '#8892b0', dotColor: '#8892b0', bgClass: 'bg-slate-800 border-slate-700' },
  STARTUP: { color: 'var(--cyan, #06b6d4)', dotColor: 'var(--cyan, #06b6d4)', bgClass: 'bg-cyan-950 border-cyan-900' },
  HEALTHY: { color: 'var(--emerald, #10b981)', dotColor: 'var(--emerald, #10b981)', bgClass: 'bg-emerald-950 border-emerald-900' },
  WARNING: { color: 'var(--amber, #f59e0b)', dotColor: 'var(--amber, #f59e0b)', bgClass: 'bg-amber-950 border-amber-900' },
  CRITICAL: { color: 'var(--red, #ef4444)', dotColor: 'var(--red, #ef4444)', bgClass: 'bg-red-950 border-red-900' },
  TRIPPED: { color: 'var(--red, #ef4444)', dotColor: 'var(--red, #ef4444)', bgClass: 'bg-red-950 border-red-900' },
};

export function StatusBadge({ state }: StatusBadgeProps) {
  const config = stateConfig[state] || stateConfig.OFF;
  const isCritical = state === 'CRITICAL' || state === 'TRIPPED';

  return (
    <div 
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium tracking-wider uppercase transition-colors duration-300 badge-${state.toLowerCase()} ${config.bgClass}`}
      style={{ color: config.color }}
    >
      <span className="relative flex h-2 w-2 mr-2">
        {isCritical && (
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
            style={{ backgroundColor: config.dotColor }} 
          />
        )}
        <span 
          className="relative inline-flex rounded-full h-2 w-2" 
          style={{ backgroundColor: config.dotColor }}
        />
      </span>
      {state}
    </div>
  );
}
