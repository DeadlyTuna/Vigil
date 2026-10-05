'use client';

import { Bell, Power } from 'lucide-react';

interface GpioProps {
  gpio: {
    ledG: boolean;
    ledY: boolean;
    ledR: boolean;
    buzzer: boolean;
    relayTrip: boolean;
  };
}

export default function GpioPanel({ gpio }: GpioProps) {
  return (
    <div className="card p-4 flex items-center justify-between gap-6 overflow-x-auto h-full">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className={`w-4 h-4 rounded-full transition-all duration-300 ${gpio.ledG ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-800'}`} />
          <span className="text-[10px] font-mono text-[var(--text-muted)]">OK</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-4 h-4 rounded-full transition-all duration-300 ${gpio.ledY ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-gray-800'}`} />
          <span className="text-[10px] font-mono text-[var(--text-muted)]">WARN</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-4 h-4 rounded-full transition-all duration-300 ${gpio.ledR ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-gray-800'}`} />
          <span className="text-[10px] font-mono text-[var(--text-muted)]">TRIP</span>
        </div>
      </div>
      
      <div className="h-10 w-px bg-[var(--border-subtle)] mx-2" />
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <Bell 
            size={20} 
            className={`transition-colors ${gpio.buzzer ? 'text-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-[var(--text-muted)] opacity-30'}`} 
          />
          <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">BUZZER</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Power 
            size={20} 
            className={`transition-colors ${gpio.relayTrip ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-emerald-500'}`} 
          />
          <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
            {gpio.relayTrip ? 'TRIPPED' : 'RELAY'}
          </span>
        </div>
      </div>
    </div>
  );
}
