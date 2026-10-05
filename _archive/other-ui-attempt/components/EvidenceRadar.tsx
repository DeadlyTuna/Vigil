'use client';

import React, { useEffect, useRef } from 'react';
import { Evidence } from '../../lib/sim/classifier';
import { FAULT_META } from '../../lib/sim/config';

interface EvidenceRadarProps {
  evidence: Evidence;
}

export function EvidenceRadar({ evidence }: EvidenceRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 30; // padding for labels
    
    ctx.clearRect(0, 0, width, height);
    
    const keys = Object.keys(FAULT_META) as (keyof Evidence)[];
    const numAxes = keys.length;
    if (numAxes === 0) return;
    
    const angleStep = (Math.PI * 2) / numAxes;
    
    // Draw background grid (hexagons)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let ring = 1; ring <= 4; ring++) {
      const r = (radius / 4) * ring;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw axes & labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#888';
    
    keys.forEach((key, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Draw label
      const label = FAULT_META[key as keyof typeof FAULT_META]?.label || key;
      const labelX = cx + Math.cos(angle) * (radius + 15);
      const labelY = cy + Math.sin(angle) * (radius + 15);
      ctx.fillText(label, labelX, labelY);
    });
    
    // Draw data polygon
    ctx.beginPath();
    keys.forEach((key, i) => {
      const value = evidence[key] || 0;
      // Normalize value assuming max is 1.0
      const r = radius * Math.min(1, Math.max(0, value));
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    
    // Fill and outline
    ctx.fillStyle = 'rgba(6, 182, 212, 0.3)'; // cyan with opacity
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
  }, [evidence]);

  return (
    <div className="flex items-center justify-center p-2">
      <canvas 
        ref={canvasRef} 
        width={220} 
        height={220} 
        style={{ width: '220px', height: '220px' }}
      />
    </div>
  );
}
