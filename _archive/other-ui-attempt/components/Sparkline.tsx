'use client';

import React, { useEffect, useRef } from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = 'var(--cyan)',
  filled = true,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Prevent division by zero
    
    const points = data.map((val, i) => ({
      x: (i / (data.length - 1 || 1)) * width,
      y: height - ((val - min) / range) * (height * 0.8) - (height * 0.1), // 10% padding top/bottom
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Draw smooth line
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + curr.y) / 2);
      if (i === points.length - 1) {
        ctx.lineTo(curr.x, curr.y);
      }
    }

    // Line style
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Glow effect
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;
    ctx.stroke();
    
    // Reset shadow for fill
    ctx.shadowBlur = 0;

    if (filled && points.length > 1) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      // Parse CSS variable or hex for gradient, simple approximation if rgb/hex not trivial
      // We will just use semi-transparent white/color mix if we can't parse easily. 
      // For simplicity, relying on global alpha.
      ctx.globalAlpha = 0.2;
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.lineTo(points[0].x, height);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

  }, [data, width, height, color, filled]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height, display: 'block' }}
      className="sparkline-canvas"
    />
  );
}
