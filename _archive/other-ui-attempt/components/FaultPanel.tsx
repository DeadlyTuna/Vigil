'use client';

import { FAULT_KEYS, FAULT_META } from '../../lib/sim/config';
import { useSim } from './SimProvider';
import { useState } from 'react';
import { Settings, Play, XCircle, Activity, RefreshCcw } from 'lucide-react';

export default function FaultPanel() {
  const { controls } = useSim();

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-bright)]">
          <Activity size={20} className="text-accent-red" />
          Fault Injection
        </h2>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1.5 border border-[var(--border-subtle)] rounded-md text-xs font-medium hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-1 text-[var(--text-bright)]"
            onClick={() => controls.resetSystem()}
          >
            <RefreshCcw size={14} /> Reset Trip
          </button>
          <button 
            className="px-3 py-1.5 bg-accent-cyan text-black rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
            onClick={() => FAULT_KEYS.forEach(k => controls.setFault(k, { severity: 0, driftRate: 0 }))}
          >
            Maintenance (Clear All)
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-auto">
        {FAULT_KEYS.map(key => {
          const meta = FAULT_META[key];
          return (
            <FaultCard 
              key={key} 
              faultKey={key} 
              meta={meta} 
              controls={controls} 
            />
          );
        })}
      </div>
    </div>
  );
}

function FaultCard({ faultKey, meta, controls }: any) {
  const [val, setVal] = useState(0);

  return (
    <div className="bg-[var(--bg-card-inner)] border border-[var(--border-subtle)] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-mono text-sm text-[var(--text-bright)] font-bold">{meta.name}</h3>
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">{meta.desc}</p>
        </div>
        <div className="flex gap-1">
          {meta.channels.map((ch: string) => (
            <div key={ch} title={`Affects ${ch}`} className={`w-2 h-2 rounded-full opacity-70 ${ch.startsWith('v') ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-auto pt-2">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="flex-1 accent-amber-500"
        />
        <span className="font-mono text-xs w-8 text-right text-[var(--text-bright)]">{val}%</span>
      </div>

      <div className="flex gap-2 mt-2">
        <button 
          className="flex-1 py-1 px-2 border border-[var(--border-subtle)] rounded text-xs font-medium hover:bg-[var(--bg-hover)] transition-colors flex justify-center items-center gap-1 text-[var(--text-bright)]"
          onClick={() => controls.setFault(faultKey, { severity: val / 100, driftRate: 0 })}
        >
          <Play size={12} className="text-accent-cyan"/> Inject
        </button>
        <button 
          className="flex-1 py-1 px-2 border border-[var(--border-subtle)] rounded text-xs font-medium hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-bright)]"
          onClick={() => controls.setFault(faultKey, { severity: val / 100, driftRate: (val / 100) / 60 })}
        >
          Gradual (60s)
        </button>
        <button 
          className="py-1 px-2 border border-[var(--border-subtle)] rounded text-xs hover:bg-[var(--bg-hover)] transition-colors text-accent-red"
          onClick={() => { setVal(0); controls.setFault(faultKey, { severity: 0, driftRate: 0 }); }}
          title="Clear"
        >
          <XCircle size={14} />
        </button>
      </div>
    </div>
  );
}
