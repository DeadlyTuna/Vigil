'use client';

import { MCU } from '../../lib/sim/config';

interface MemoryMapProps {
  mem: {
    heapUsed: number;
    stackUsed: number;
    staticUsed: number;
  };
}

export default function MemoryMap({ mem }: MemoryMapProps) {
  const sramUsed = mem.heapUsed + mem.stackUsed + mem.staticUsed;
  const sramTotal = MCU.SRAM_KB * 1024;
  const flashUsed = MCU.FLASH_KB * 1024 * 0.45; // Simulated flash usage
  const flashTotal = MCU.FLASH_KB * 1024;

  const sramPct = (sramUsed / sramTotal) * 100;
  const flashPct = (flashUsed / flashTotal) * 100;

  return (
    <div className="card p-4 flex flex-col gap-5 h-full">
      <h3 className="text-sm font-bold text-[var(--text-bright)]">MCU Memory Map</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-mono text-[var(--text-bright)] mb-1">
            <span>SRAM</span>
            <span>{Math.round(sramUsed/1024)} / {MCU.SRAM_KB} KB ({sramPct.toFixed(1)}%)</span>
          </div>
          <div className="h-5 bg-[var(--bg-card-inner)] rounded-md overflow-hidden flex w-full border border-[var(--border-subtle)]">
            <div style={{width: `${(mem.staticUsed / sramTotal) * 100}%`}} className="bg-blue-500 h-full transition-all duration-500" title="Static" />
            <div style={{width: `${(mem.heapUsed / sramTotal) * 100}%`}} className="bg-purple-500 h-full transition-all duration-500" title="Heap" />
            <div style={{width: `${(mem.stackUsed / sramTotal) * 100}%`}} className="bg-emerald-500 h-full transition-all duration-500" title="Stack" />
          </div>
          <div className="flex gap-4 mt-2 text-[10px] font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block"/> .bss/.data</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500 inline-block"/> Heap</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"/> Stack</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-[var(--text-bright)] mb-1">
            <span>Flash</span>
            <span>{Math.round(flashUsed/1024)} / {MCU.FLASH_KB} KB ({flashPct.toFixed(1)}%)</span>
          </div>
          <div className="h-5 bg-[var(--bg-card-inner)] rounded-md overflow-hidden flex w-full border border-[var(--border-subtle)]">
            <div style={{width: `${flashPct}%`}} className="bg-cyan-600 h-full" title=".text" />
          </div>
          <div className="flex gap-4 mt-2 text-[10px] font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-600 inline-block"/> .text/.rodata</span>
          </div>
        </div>
      </div>
    </div>
  );
}
