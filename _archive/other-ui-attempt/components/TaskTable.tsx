'use client';

import React from 'react';
import { TaskRow } from '../../lib/sim/simulator';

interface TaskTableProps {
  tasks: TaskRow[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="card w-full overflow-hidden flex flex-col glass-panel">
      <div className="card-header pb-2 border-b border-white/10 mb-2 px-4 pt-4">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">RTOS Tasks</h3>
      </div>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-white/50 border-b border-white/5 uppercase text-xs tracking-wider">
              <th className="py-2 px-2 font-medium">Pri</th>
              <th className="py-2 px-2 font-medium">Name</th>
              <th className="py-2 px-2 font-medium">Period</th>
              <th className="py-2 px-2 font-medium w-32">CPU Load</th>
              <th className="py-2 px-2 font-medium">Resp (Avg/Max)</th>
              <th className="py-2 px-2 font-medium">Misses</th>
              <th className="py-2 px-2 font-medium w-32">Stack</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs">
            {tasks.map((task) => {
              const loadPercent = Math.min(100, Math.max(0, task.cpuLoad));
              const stackPercent = Math.min(100, Math.max(0, (task.stackUsed / task.stackTotal) * 100));
              
              return (
                <tr key={task.name} className="hover:bg-white/5 transition-colors">
                  <td className="py-2 px-2 text-center">
                    <span 
                      className="inline-block w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: task.color || '#00ffcc', boxShadow: `0 0 8px ${task.color || '#00ffcc'}` }} 
                    />
                  </td>
                  <td className="py-2 px-2 font-semibold text-white">{task.name}</td>
                  <td className="py-2 px-2 text-white/70">{task.period} ms</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right text-white/80">{loadPercent.toFixed(1)}%</span>
                      <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden flex-1">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${loadPercent}%`, backgroundColor: task.color || '#00ffcc' }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-white/70">
                    {task.responseAvg.toFixed(2)} / {task.responseMax.toFixed(2)} ms
                  </td>
                  <td className="py-2 px-2">
                    <span className={task.deadlineMisses > 0 ? 'text-red-400 font-bold' : 'text-emerald-400/50'}>
                      {task.deadlineMisses}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-white/50 text-right leading-none">
                        {task.stackUsed}/{task.stackTotal}
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            stackPercent > 80 ? 'bg-red-500' : stackPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stackPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
