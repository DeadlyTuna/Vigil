'use client';

import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../../lib/sim/firmware';
import { Info, AlertTriangle, XOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface EventLogProps {
  events: LogEntry[];
}

export function EventLog({ events }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return <Info size={14} className="text-cyan-500" />;
      case 'warn':
        return <AlertTriangle size={14} className="text-amber-500" />;
      case 'error':
        return <XOctagon size={14} className="text-red-500" />;
      case 'critical':
        return <ShieldAlert size={14} className="text-red-600 animate-pulse" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      default:
        return <Info size={14} className="text-white/50" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info': return 'text-cyan-500';
      case 'warn': return 'text-amber-500';
      case 'error': return 'text-red-500';
      case 'critical': return 'text-red-600 font-bold';
      case 'success': return 'text-emerald-500';
      default: return 'text-white/50';
    }
  };

  return (
    <div className="card w-full flex flex-col glass-panel max-h-[400px]">
      <div className="card-header pb-2 border-b border-white/10 px-4 pt-4 flex-shrink-0">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">System Events</h3>
      </div>
      <div 
        ref={scrollRef}
        className="overflow-y-auto px-4 py-2 flex-1 space-y-1 font-mono text-[11px] sm:text-xs"
      >
        {events.length === 0 ? (
          <div className="text-white/30 italic py-4 text-center">No events logged</div>
        ) : (
          events.slice().reverse().map((event, idx) => (
            <div 
              key={idx} 
              className={`log-line flex items-start gap-2 p-1.5 hover:bg-white/5 rounded transition-colors log-${event.level.toLowerCase()}`}
            >
              <span className="log-time text-white/40 whitespace-nowrap min-w-[70px]">
                {(event.timestamp / 1000).toFixed(3)}s
              </span>
              <span className="flex-shrink-0 mt-0.5">
                {getLevelIcon(event.level)}
              </span>
              <span className="log-code text-white/50 min-w-[60px] font-bold tracking-wider">
                [{event.code}]
              </span>
              <span className={`flex-1 break-all ${getLevelColor(event.level)}`}>
                {event.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
