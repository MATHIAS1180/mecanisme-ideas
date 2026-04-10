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
  const lastRemainingSecondsRef = useRef<number>(remainingSeconds);
  const previousPointsRef = useRef<number[]>([]);

  const potValue = parseFloat(pot);
  const maxPotInHistory = useRef(potValue);
  
  // Mettre à jour le max pot si le pot actuel est plus grand
  useEffect(() => {
    if (potValue > maxPotInHistory.current) {
      maxPotInHistory.current = potValue;
    }
  }, [potValue]);
  
  const maxPot = Math.max(maxPotInHistory.current, 0.01);

  // Detect timer reset (new deposit or action that resets countdown)
  useEffect(() => {
    // If remaining seconds increased significantly (more than 2 seconds), it's a reset
    if (remainingSeconds > lastRemainingSecondsRef.current + 2) {
      // Save current points to continue from
      previousPointsRef.current = [...dataPoints];
      // Reset cycle start time to now
      cycleStartTimeRef.current = Date.now();
      console.log("🔄 Timer reset detected! Continuing curve from current position");
    }
    lastRemainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds, dataPoints]);

  // Générer courbe: MONTE AVEC LE POT, RESTE PLATE, START À 0
  useEffect(() => {
    if (!isActive) {
      setDataPoints([]);
      previousPointsRef.current = [];
      maxPotInHistory.current = potValue;
      return;
    }

    let animFrame: number;
    
    const updateCurve = () => {
      // La courbe représente le pot au fil du temps
      // Elle monte quand le pot augmente, reste plate sinon
      
      setDataPoints(prev => {
        // Si c'est le premier point, commencer à 0
        if (prev.length === 0) {
          return [0, potValue];
        }
        
        const newPoints = [...prev, potValue];
        // Garder les 100 derniers points
        return newPoints.slice(-100);
      });
      
      // Mettre à jour toutes les 500ms (2 fois par seconde)
      setTimeout(() => {
        animFrame = requestAnimationFrame(updateCurve);
      }, 500);
    };

    updateCurve();
    
    return () => {
      if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    };
  }, [potValue, isActive]);

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

      // Labels Y-axis - EN SOL (POT)
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      
      for (let i = 0; i <= 5; i++) {
        const solValue = maxPot * (1 - i / 5);
        const y = padding.top + (chartHeight / 5) * i;
        ctx.fillText(solValue.toFixed(3) + " SOL", width - padding.right + 5, y + 4);
      }

      // Courbe
      if (dataPoints.length > 1) {
        const points = dataPoints.map((value, i) => ({
          x: padding.left + (chartWidth / (dataPoints.length - 1)) * i,
          y: padding.top + chartHeight - (value / maxPot) * chartHeight,
        }));

        // Calculer la couleur - TOUJOURS VERTE
        const lineColor = "#8cf5c5"; // Vert fixe
        const fillColorTop = "rgba(140, 245, 197, 0.3)";
        const fillColorBottom = "rgba(140, 245, 197, 0.0)";

        // Gradient fill avec couleur dynamique
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, fillColorTop);
        gradient.addColorStop(1, fillColorBottom);

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

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Point actuel avec couleur dynamique
        const lastPoint = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.strokeStyle = "#0a1f1a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Timer au centre
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
  }, [dataPoints, remainingSeconds, maxSeconds, maxPot]);

  return (
    <div className="crypto-chart">
      <canvas 
        ref={canvasRef} 
        className="crypto-chart__canvas"
        style={{ height: 'clamp(200px, 35vh, 380px)' }}
      />
    </div>
  );
}
