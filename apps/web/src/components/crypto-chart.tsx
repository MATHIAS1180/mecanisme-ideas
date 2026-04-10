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
  const maxPotInHistory = useRef(0);
  
  // Mettre à jour le max pot
  useEffect(() => {
    if (potValue > maxPotInHistory.current) {
      maxPotInHistory.current = potValue;
    }
  }, [potValue]);
  
  const maxPot = Math.max(maxPotInHistory.current, 0.01);

  // Gérer les points de données - RÉACTION INSTANTANÉE
  useEffect(() => {
    if (!isActive) {
      setDataPoints([]);
      maxPotInHistory.current = 0;
      return;
    }

    setDataPoints(prev => {
      // Toujours commencer par 0
      const basePoints = prev.length === 0 ? [0] : prev;
      
      // INSTANTANÉ: Ajouter le nouveau point immédiatement
      const lastPoint = basePoints[basePoints.length - 1];
      if (Math.abs(lastPoint - potValue) > 0.00001) { // Seuil très bas pour réactivité
        const newPoints = [...basePoints, potValue];
        return newPoints.length > 60 ? newPoints.slice(-60) : newPoints;
      }
      
      return basePoints;
    });
  }, [potValue, isActive]); // Pas de dépendance sur dataPoints.length pour réactivité max

  // Ajouter des points plats toutes les 10ms pour animation fluide 120 FPS
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDataPoints(prev => {
        if (prev.length === 0) return [0, potValue];
        const newPoints = [...prev, potValue];
        return newPoints.length > 60 ? newPoints.slice(-60) : newPoints;
      });
    }, 10); // 10ms = 100 FPS (proche de 120 FPS)

    return () => clearInterval(interval);
  }, [potValue, isActive]);

  // Animation 120 FPS avec optimisation performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false }); // Désactiver alpha pour performance
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

    let lastFrameTime = 0;
    const targetFPS = 60; // Reduced from 120 to 60 for better performance
    const frameInterval = 1000 / targetFPS; // ~16.67ms for 60 FPS

    const animate = (currentTime: number) => {
      // Throttle à 120 FPS max
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;

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
          y: padding.top + chartHeight - (Math.min(value, maxPot) / maxPot) * chartHeight, // Clamp à maxPot
        }));

        const lineColor = "#8cf5c5"; // Vert fixe
        const fillColorTop = "rgba(140, 245, 197, 0.3)";
        const fillColorBottom = "rgba(140, 245, 197, 0.0)";

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, fillColorTop);
        gradient.addColorStop(1, fillColorBottom);

        // Fill area
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        
        // Lignes droites simples (pas de spline pour éviter dépassement)
        for (let i = 0; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Ligne de contour
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Point actuel
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

    animationRef.current = requestAnimationFrame(animate);

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
