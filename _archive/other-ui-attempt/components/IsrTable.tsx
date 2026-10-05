'use client';

import React from 'react';
import { IsrRow } from '../../lib/sim/simulator';

interface IsrTableProps {
  isrs: IsrRow[];
}

export function IsrTable({ isrs }: IsrTableProps) {
  return (
    <div className="card w-full overflow-hidden flex flex-col glass-panel">
      <div className="card-header pb-2 border-b border-white/10 mb-2 px-4 pt-4">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">Interrupt Service Routines</h3>
      </div>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-white/50 border-b border-white/5 uppercase text-xs tracking-wider">
              <th className="py-2 px-2 font-medium">Name</th>
              <th className="py-2 px-2 font-medium">Source</th>
              <th className="py-2 px-2 font-medium">NVIC Pri</th>
              <th className="py-2 px-2 font-medium">Rate (Hz)</th>
              <th className="py-2 px-2 font-medium">Count</th>
              <th className="py-2 px-2 font-medium">Latency (µs)</th>
              <th className="py-2 px-2 font-medium">Max Latency</th>
              <th className="py-2 px-2 font-medium">Cost (µs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs">
            {isrs.map((isr) => (
              <tr key={isr.name} className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-2 font-semibold text-white">{isr.name}</td>
                <td className="py-2 px-2 text-white/50">{isr.source}</td>
                <td className="py-2 px-2 text-emerald-400">{isr.nvicPriority}</td>
                <td className="py-2 px-2 text-white/80">{isr.rate.toFixed(1)}</td>
                <td className="py-2 px-2 text-white/60">{isr.count}</td>
                <td className="py-2 px-2 text-white/80">{isr.latencyAvg.toFixed(2)}</td>
                <td className="py-2 px-2 text-amber-400/80">{isr.latencyMax.toFixed(2)}</td>
                <td className="py-2 px-2 text-white/70">{isr.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
