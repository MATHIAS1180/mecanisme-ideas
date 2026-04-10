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
  const cycleStartTimeRef = useRef<number>(Date.now());
  const lastMaxSecondsRef = useRef<number>(maxSeconds);

  const potValue = parseFloat(pot);
  const maxPot = Math.max(potValue, 0.01);

  // Reset cycle start time when cycle changes (maxSeconds changes or remainingSeconds increases)
  useEffect(() => {
    if (maxSeconds !== lastMaxSecondsRef.current || remainingSeconds > lastMaxSecondsRef.current) {
      cycleStartTimeRef.current = Date.now() - ((maxSeconds - remainingSeconds) * 1000);
      lastMaxSecondsRef.current = maxSeconds;
    }
  }, [remainingSeconds, maxSeconds]);

  // Générer courbe: ANIMATION CONTINUE FLUIDE
  useEffect(() => {
    if (!isActive) {
      setDataPoints([]);
      return;
    }

    let animFrame: number;
    
    const updateCurve = () => {
      // Calculer le temps écoulé depuis le début du cycle avec précision milliseconde
      const now = Date.now();
      const elapsedMs = now - cycleStartTimeRef.current;
      const elapsedSeconds = elapsedMs / 1000;
      const progress = Math.min(Math.max(elapsedSeconds / maxSeconds, 0), 1);
      
      const points: number[] = [];
      const numPoints = 120; // Plus de points pour plus de fluidité
      
      // Phase de montée: 0.5 secondes max (instantané)
      const riseTime = Math.min(0.5, maxSeconds * 0.05); // 5% du temps ou 0.5s max
      const riseProgress = Math.min(elapsedSeconds / riseTime, 1);
      
      if (elapsedSeconds <= riseTime) {
        // En phase de montée - animation rapide
        const currentPoints = Math.floor(riseProgress * 20); // 20 points pour la montée
        for (let i = 0; i <= currentPoints; i++) {
          const t = i / 20;
          points.push(potValue * t);
        }
      } else {
        // Phase de descente - animation fluide
        const descendStart = riseTime;
        const descendDuration = maxSeconds - riseTime;
        const descendElapsed = elapsedSeconds - descendStart;
        const descendProgress = Math.min(descendElapsed / descendDuration, 1);
        
        // Ajouter les points de montée (complets)
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          points.push(potValue * t);
        }
        
        // Ajouter les points de descente jusqu'au temps actuel
        const descendPoints = Math.floor(descendProgress * 100); // 100 points pour la descente
        for (let i = 0; i <= descendPoints; i++) {
          const t = i / 100;
          const value = potValue * (1 - t * 0.4); // Descend de 40%
          points.push(value);
        }
      }
      
      setDataPoints(points);
      animFrame = requestAnimationFrame(updateCurve);
    };

    updateCurve();
    
    return () => {
      if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    };
  }, [maxSeconds, potValue, isActive]);

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

      // Labels Y-axis - EN SECONDES
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      
      for (let i = 0; i <= 5; i++) {
        const seconds = maxSeconds * (1 - i / 5);
        const y = padding.top + (chartHeight / 5) * i;
        ctx.fillText(Math.floor(seconds) + "s", width - padding.right + 5, y + 4);
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
