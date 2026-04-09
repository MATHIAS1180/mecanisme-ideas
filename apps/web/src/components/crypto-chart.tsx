"use client";

import { useEffect, useRef, useState } from "react";
import "./crypto-chart.css";

interface CryptoChartProps {
  remainingSeconds: number;
  maxSeconds: number;
  pressure: number;
  pot: string;
  leader: string;
  isActive: boolean;
}

export function CryptoChart({ remainingSeconds, maxSeconds, pressure, pot, leader, isActive }: CryptoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);

  const potValue = parseFloat(pot);
  const maxPot = Math.max(potValue, 0.01);

  // Générer courbe: monte de 0 à pot, puis descend avec le timer
  useEffect(() => {
    if (!isActive) {
      setDataPoints([]);
      return;
    }

    const elapsed = maxSeconds - remainingSeconds;
    const progress = elapsed / maxSeconds;
    
    const points: number[] = [];
    const numPoints = 60;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      if (t <= 0.15) {
        // Phase montée (15% du temps): 0 → potValue
        const riseProgress = t / 0.15;
        points.push(potValue * riseProgress);
      } else {
        // Phase descente (85% du temps): suit le timer
        const fallProgress = (t - 0.15) / 0.85;
        const currentProgress = Math.min(progress, 1);
        
        if (currentProgress < fallProgress) {
          points.push(potValue);
        } else {
          const descendProgress = (currentProgress - fallProgress) / (1 - fallProgress);
          points.push(potValue * (1 - descendProgress * 0.4));
        }
      }
    }
    
    setDataPoints(points);
  }, [remainingSeconds, maxSeconds, potValue, isActive]);

  // Animation 120 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 60, bottom: 40, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Grille TradingView
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      for (let i = 0; i <= 10; i++) {
        const x = padding.left + (chartWidth / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
      }

      // Labels Y-axis
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      
      for (let i = 0; i <= 5; i++) {
        const value = maxPot * (1 - i / 5);
        const y = padding.top + (chartHeight / 5) * i;
        ctx.fillText(value.toFixed(4), width - padding.right + 5, y + 4);
      }

      // Courbe
      if (dataPoints.length > 1) {
        const points = dataPoints.map((value, i) => ({
          x: padding.left + (chartWidth / (dataPoints.length - 1)) * i,
          y: padding.top + chartHeight - (value / maxPot) * chartHeight,
        }));

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, "rgba(140, 245, 197, 0.3)");
        gradient.addColorStop(1, "rgba(140, 245, 197, 0.0)");

        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        ctx.lineTo(points[0].x, points[0].y);

        // Catmull-Rom spline
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[Math.max(0, i - 1)];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[Math.min(points.length - 1, i + 2)];

          for (let t = 0; t <= 1; t += 0.1) {
            const t2 = t * t;
            const t3 = t2 * t;

            const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
            const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Ligne
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[Math.max(0, i - 1)];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[Math.min(points.length - 1, i + 2)];

          for (let t = 0; t <= 1; t += 0.1) {
            const t2 = t * t;
            const t3 = t2 * t;

            const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
            const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = "#8cf5c5";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Point actuel
        const lastPoint = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#8cf5c5";
        ctx.fill();
        ctx.strokeStyle = "#0a1f1a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Timer
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = remainingSeconds <= 10 ? "#ff6b6b" : "#ffffff";
      ctx.fillText(timeStr, width / 2, height / 2);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dataPoints, remainingSeconds, maxPot]);

  return (
    <div className="crypto-chart">
      <canvas 
        ref={canvasRef} 
        className="crypto-chart__canvas"
        style={{ height: 'clamp(200px, 35vh, 380px)' }}
      />
      <div className="crypto-chart__stats">
        <div className="crypto-chart__stat">
          <span className="crypto-chart__label">POT</span>
          <span className="crypto-chart__value crypto-chart__value--pot">{pot} SOL</span>
        </div>
        <div className="crypto-chart__stat">
          <span className="crypto-chart__label">LEADER</span>
          <span className="crypto-chart__value">{leader}</span>
        </div>
        <div className="crypto-chart__stat">
          <span className="crypto-chart__label">PRESSURE</span>
          <span className="crypto-chart__value crypto-chart__value--pressure">{pressure} / 40</span>
        </div>
      </div>
    </div>
  );
}
