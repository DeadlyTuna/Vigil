'use client';

import { useEffect, useRef } from 'react';
import { SPEC_BINS, BIN_HZ, BPFO_RATIO } from '../../lib/sim/config';

interface SpecWaterfallProps {
  specV: Float32Array;
  frHz: number;
}

export default function SpecWaterfall({ specV, frHz }: SpecWaterfallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use actual dimensions for rendering, handling high-DPI displays could be added here
    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, w, h);

    if (!specV || specV.length === 0) return;

    // Draw grid
    ctx.strokeStyle = '#1f2937'; // gray-800
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const y = i * (h / 4);
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    for (let i = 0; i < 10; i++) {
      const x = i * (w / 10);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();

    const maxFreq = SPEC_BINS * BIN_HZ;
    
    // Helper to draw vertical frequency markers
    const drawMarker = (freq: number, label: string, color: string) => {
      const x = (freq / maxFreq) * w;
      if (x > w || x < 0) return;
      
      ctx.strokeStyle = color;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = color;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(label, x + 4, 12);
    };

    // Draw harmonics & BPFO markers
    drawMarker(frHz, '1x', '#f59e0b'); // amber
    drawMarker(frHz * 2, '2x', '#f59e0b');
    drawMarker(frHz * 3, '3x', '#f59e0b');
    drawMarker(frHz * BPFO_RATIO, 'BPFO', '#ef4444'); // red

    // Draw spectrum curve
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4'; // cyan-500
    ctx.lineWidth = 1.5;
    
    // Find max value for dynamic scaling, minimum scale for low noise
    let maxVal = 0;
    for (let i = 0; i < specV.length; i++) {
      if (specV[i] > maxVal) maxVal = specV[i];
    }
    const scaleY = maxVal > 0.01 ? h / (maxVal * 1.2) : h / 0.05;

    for (let i = 0; i < specV.length; i++) {
      const x = (i / specV.length) * w;
      const y = h - (specV[i] * scaleY);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
    ctx.fill();

  }, [specV, frHz]);

  return (
    <div className="card p-4 flex flex-col h-full gap-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[var(--text-bright)]">Vibration Spectrum</h3>
        <span className="text-xs font-mono text-[var(--text-muted)]">Amplitude vs Frequency (Hz)</span>
      </div>
      <div className="flex-1 w-full relative min-h-[180px] bg-[#0a0b10] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={800}
          height={180}
          className="absolute inset-0 w-full h-full object-fill"
        />
      </div>
    </div>
  );
}
