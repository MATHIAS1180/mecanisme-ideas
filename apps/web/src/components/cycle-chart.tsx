"use client";

import { useEffect, useRef, useState } from "react";
import "./cycle-chart.css";

interface CycleChartProps {
  remainingSeconds: number;
  maxSeconds: number;
  pressure: number;
  pot: string;
  leader: string;
  isActive: boolean;
}

export function CycleChart({
  remainingSeconds,
  maxSeconds,
  pressure,
  pot,
  leader,
  isActive,
}: CycleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localTimer, setLocalTimer] = useState(remainingSeconds);
  const lastUpdateRef = useRef(Date.now());
  const initialTimerRef = useRef(remainingSeconds);

  // Timer fluide côté client (pas de RPC)
  useEffect(() => {
    // Quand remainingSeconds change (update du serveur), on reset
    setLocalTimer(remainingSeconds);
    lastUpdateRef.current = Date.now();
    initialTimerRef.current = remainingSeconds;
  }, [remainingSeconds]);

  // Animation fluide du timer (60 FPS)
  useEffect(() => {
    if (!isActive || localTimer <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000;
      const newTimer = Math.max(0, initialTimerRef.current - elapsed);
      setLocalTimer(Math.floor(newTimer));
    }, 16); // 60 FPS

    return () => clearInterval(interval);
  }, [isActive, localTimer]);

  // Dessin du graphique
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const progress = maxSeconds > 0 ? localTimer / maxSeconds : 0;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, width, height);

    // Grid lines (style trading)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ligne de temps (descend de haut en bas)
    const points: { x: number; y: number }[] = [];
    const segments = 100;
    
    for (let i = 0; i <= segments; i++) {
      const x = (width / segments) * i;
      const progressAtPoint = 1 - (i / segments) * (1 - progress);
      const y = height * (1 - progressAtPoint);
      points.push({ x, y });
    }

    // Gradient sous la ligne
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (progress > 0.5) {
      gradient.addColorStop(0, "rgba(0, 255, 136, 0.2)");
      gradient.addColorStop(1, "rgba(0, 255, 136, 0)");
    } else if (progress > 0.2) {
      gradient.addColorStop(0, "rgba(255, 170, 0, 0.2)");
      gradient.addColorStop(1, "rgba(255, 170, 0, 0)");
    } else {
      gradient.addColorStop(0, "rgba(255, 68, 68, 0.2)");
      gradient.addColorStop(1, "rgba(255, 68, 68, 0)");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fill();

    // Ligne principale
    ctx.strokeStyle = progress > 0.5 ? "#00ff88" : progress > 0.2 ? "#ffaa00" : "#ff4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Glow effect
    if (isActive) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = progress > 0.5 ? "#00ff88" : progress > 0.2 ? "#ffaa00" : "#ff4444";
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Point actuel (bout de la ligne)
    const lastPoint = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = progress > 0.5 ? "#00ff88" : progress > 0.2 ? "#ffaa00" : "#ff4444";
    ctx.fill();
    ctx.strokeStyle = "#0a0e1a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Timer overlay
    const minutes = Math.floor(localTimer / 60);
    const seconds = localTimer % 60;
    const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    
    ctx.font = "bold 56px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(timeText, width / 2, height / 2);

    // Pressure dots
    const maxPressure = 40;
    const dotSize = 4;
    const dotSpacing = 8;
    const totalWidth = maxPressure * (dotSize + dotSpacing);
    const startX = (width - totalWidth) / 2;
    const dotY = height - 20;

    for (let i = 0; i < maxPressure; i++) {
      const x = startX + i * (dotSize + dotSpacing);
      ctx.beginPath();
      ctx.arc(x, dotY, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = i < pressure ? "#ff6b6b" : "rgba(255, 255, 255, 0.1)";
      ctx.fill();
    }

  }, [localTimer, maxSeconds, pressure, isActive]);

  return (
    <div className="cycle-chart">
      <canvas
        ref={canvasRef}
        width={1000}
        height={400}
        className="cycle-chart__canvas"
      />
      <div className="cycle-chart__stats">
        <div className="cycle-chart__stat">
          <span className="cycle-chart__label">POT</span>
          <span className="cycle-chart__value">{pot} SOL</span>
        </div>
        <div className="cycle-chart__stat">
          <span className="cycle-chart__label">LEADER</span>
          <span className="cycle-chart__value">{leader}</span>
        </div>
        <div className="cycle-chart__stat">
          <span className="cycle-chart__label">PRESSURE</span>
          <span className="cycle-chart__value">{pressure} / 40</span>
        </div>
      </div>
    </div>
  );
}
