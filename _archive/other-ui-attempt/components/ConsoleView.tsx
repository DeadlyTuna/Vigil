'use client';

import React, { useEffect, useRef } from 'react';
import { ConsoleLine } from '../../lib/sim/firmware';

interface ConsoleViewProps {
  lines: ConsoleLine[];
}

export function ConsoleView({ lines }: ConsoleViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info': return 'text-cyan-400';
      case 'warn': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'debug': return 'text-white/40';
      default: return 'text-white/70';
    }
  };

  return (
    <div className="w-full flex flex-col rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-[#080a10] max-h-[350px]">
      <div className="h-8 bg-[#1a1b26] flex items-center px-3 border-b border-white/5 flex-shrink-0">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
        </div>
        <div className="mx-auto text-[10px] text-white/30 uppercase tracking-widest font-sans font-medium">
          TTY1 - System Console
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed selection:bg-cyan-500/30"
      >
        {lines.length === 0 ? (
          <div className="text-white/30 italic">Initializing console...</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className="flex gap-3 hover:bg-white/5 px-1 py-0.5 rounded-sm">
              <span className="text-white/30 select-none flex-shrink-0 w-16">
                {(line.timestamp / 1000).toFixed(3)}
              </span>
              <span className={`break-words ${getLevelColor(line.level)}`}>
                {line.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
