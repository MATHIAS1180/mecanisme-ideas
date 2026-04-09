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

interface DataPoint {
  time: number;
  value: number;
  timestamp: number;
}

export function CryptoChart({
  remainingSeconds,
  maxSeconds,
  pressure,
  pot,
  leader,
  isActive,
}: CryptoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localTimer, setLocalTimer] = useState(remainingSeconds);
  const lastUpdateRef = useRef(Date.now());
  const dataPointsRef = useRef<DataPoint[]>([]);
  const lastPotRef = useRef(parseFloat(pot) || 0);
  const animationFrameRef = useRef<number>(0);
  const smoothValueRef = useRef(parseFloat(pot) || 0);
  const cycleStartTimeRef = useRef(Date.now());

  // Sync timer avec les props
  useEffect(() => {
    setLocalTimer(remainingSeconds);
    lastUpdateRef.current = Date.now();
  }, [remainingSeconds]);

  // Détecter nouveau cycle et reset
  useEffect(() => {
    if (remainingSeconds === maxSeconds) {
      dataPointsRef.current = [];
      cycleStartTimeRef.current = Date.now();
      smoothValueRef.current = parseFloat(pot) || 0;
      lastPotRef.current = parseFloat(pot) || 0;
    }
  }, [remainingSeconds, maxSeconds, pot]);

  // Ajouter des points de données en temps réel
  useEffect(() => {
    const currentPot = parseFloat(pot) || 0;
    
    if (currentPot !== lastPotRef.current) {
      const elapsed = Date.now() - cycleStartTimeRef.current;
      const progress = maxSeconds > 0 ? Math.min(1, elapsed / (maxSeconds * 1000)) : 0;
      
      dataPointsRef.current.push({
        time: progress,
        value: currentPot,
        timestamp: Date.now(),
      });

      // Garder les 200 derniers points pour une courbe ultra-smooth
      if (dataPointsRef.current.length > 200) {
        dataPointsRef.current.shift();
      }

      lastPotRef.current = currentPot;
    }
  }, [pot, maxSeconds]);

  // Animation loop 120 FPS
  useEffect(() => {
    let lastFrameTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // Update timer si actif
      if (isActive && localTimer > 0) {
        const elapsed = (now - lastUpdateRef.current) / 1000;
        const newTimer = Math.max(0, remainingSeconds - elapsed);
        setLocalTimer(newTimer);
      } else if (localTimer <= 0) {
        setLocalTimer(0);
      }

      // Smooth interpolation vers la valeur cible
      const targetValue = parseFloat(pot) || 0;
      const diff = targetValue - smoothValueRef.current;
      smoothValueRef.current += diff * Math.min(1, deltaTime * 8); // Smooth transition

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, remainingSeconds, pot, localTimer]);

  // Dessin du graphique (120 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const progress = maxSeconds > 0 ? localTimer / maxSeconds : 0;
    const currentPot = smoothValueRef.current;

    // Dimensions du graphique
    const leftMargin = 80;
    const rightMargin = 20;
    const topMargin = 40;
    const bottomMargin = 80;
    const chartWidth = width - leftMargin - rightMargin;
    const chartHeight = height - topMargin - bottomMargin;

    // Clear avec background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#0a0e1a");
    bgGradient.addColorStop(1, "#050810");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Calculer min/max pour l'échelle
    let minValue = 0;
    let maxValue = currentPot;
    
    if (dataPointsRef.current.length > 0) {
      const values = dataPointsRef.current.map((d) => d.value);
      maxValue = Math.max(...values, currentPot, 0.1);
    } else {
      maxValue = Math.max(currentPot, 0.1);
    }
    
    const range = maxValue - minValue;
    const padding = range * 0.1;
    maxValue += padding;
    const adjustedRange = maxValue - minValue;

    // Grid horizontal avec labels Y
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const gridLines = 6;
    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - (adjustedRange / gridLines) * i;
      const y = topMargin + (chartHeight / gridLines) * i;
      
      // Label
      ctx.fillText(`${value.toFixed(3)} ◎`, leftMargin - 10, y);
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(leftMargin + chartWidth, y);
      ctx.stroke();
    }

    // Grid vertical
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i <= 10; i++) {
      const x = leftMargin + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, topMargin);
      ctx.lineTo(x, topMargin + chartHeight);
      ctx.stroke();
    }

    // Construire les points de la courbe
    const points: { x: number; y: number }[] = [];
    const elapsed = Date.now() - cycleStartTimeRef.current;
    const currentProgress = maxSeconds > 0 ? Math.min(1, elapsed / (maxSeconds * 1000)) : 0;

    if (dataPointsRef.current.length === 0) {
      // Pas de données: ligne plate en bas
      const y = topMargin + chartHeight - ((0 - minValue) / adjustedRange) * chartHeight;
      points.push({ x: leftMargin, y });
      points.push({ x: leftMargin + chartWidth * currentProgress, y });
    } else {
      // Créer une courbe smooth avec interpolation
      const allPoints = [...dataPointsRef.current];
      
      // Ajouter point actuel si différent
      if (allPoints.length === 0 || allPoints[allPoints.length - 1].value !== currentPot) {
        allPoints.push({
          time: currentProgress,
          value: currentPot,
          timestamp: Date.now(),
        });
      }

      // Générer points interpolés pour ultra-smooth
      for (let i = 0; i < allPoints.length; i++) {
        const point = allPoints[i];
        const x = leftMargin + point.time * chartWidth;
        const normalizedValue = (point.value - minValue) / adjustedRange;
        const y = topMargin + chartHeight - normalizedValue * chartHeight;
        points.push({ x, y });

        // Interpolation entre points pour smoothness
        if (i < allPoints.length - 1) {
          const nextPoint = allPoints[i + 1];
          const steps = 5;
          for (let j = 1; j < steps; j++) {
            const t = j / steps;
            const interpTime = point.time + (nextPoint.time - point.time) * t;
            const interpValue = point.value + (nextPoint.value - point.value) * t;
            const interpX = leftMargin + interpTime * chartWidth;
            const interpNormalized = (interpValue - minValue) / adjustedRange;
            const interpY = topMargin + chartHeight - interpNormalized * chartHeight;
            points.push({ x: interpX, y: interpY });
          }
        }
      }

      // Trier par x pour éviter les croisements
      points.sort((a, b) => a.x - b.x);
    }

    if (points.length === 0) return;

    // Couleur dynamique selon le timer
    let lineColor = "#00ff88";
    let glowColor = "rgba(0, 255, 136, 0.6)";
    let fillColor1 = "rgba(0, 255, 136, 0.2)";
    let fillColor2 = "rgba(0, 255, 136, 0)";

    if (progress < 0.2) {
      lineColor = "#ff4444";
      glowColor = "rgba(255, 68, 68, 0.6)";
      fillColor1 = "rgba(255, 68, 68, 0.2)";
      fillColor2 = "rgba(255, 68, 68, 0)";
    } else if (progress < 0.5) {
      lineColor = "#ffaa00";
      glowColor = "rgba(255, 170, 0, 0.6)";
      fillColor1 = "rgba(255, 170, 0, 0.2)";
      fillColor2 = "rgba(255, 170, 0, 0)";
    }

    // Gradient sous la courbe
    const gradient = ctx.createLinearGradient(0, topMargin, 0, topMargin + chartHeight);
    gradient.addColorStop(0, fillColor1);
    gradient.addColorStop(1, fillColor2);

    // Remplir sous la courbe
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, topMargin + chartHeight);
    
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.lineTo(points[points.length - 1].x, topMargin + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Dessiner la courbe principale avec smooth bezier
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // Catmull-Rom spline pour ultra-smooth
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.stroke();

    // Glow effect
    if (isActive) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = glowColor;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Point actuel animé
    const lastPoint = points[points.length - 1];
    const pulseSize = 6 + Math.sin(Date.now() / 200) * 2;
    
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, pulseSize - 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Timer overlay avec effet
    const minutes = Math.floor(localTimer / 60);
    const seconds = Math.floor(localTimer % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    
    ctx.font = "bold 56px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(timeText, width / 2, height / 2);
    ctx.fillText(timeText, width / 2, height / 2);

    // Pressure bar
    const barWidth = 400;
    const barHeight = 8;
    const barX = (width - barWidth) / 2;
    const barY = height - 30;
    const pressureRatio = pressure / 40;

    // Background bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Pressure fill
    const pressureFill = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    pressureFill.addColorStop(0, "#ff6b6b");
    pressureFill.addColorStop(0.5, "#ff8c42");
    pressureFill.addColorStop(1, "#ffd700");
    ctx.fillStyle = pressureFill;
    ctx.fillRect(barX, barY, barWidth * pressureRatio, barHeight);

    // Pressure text
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText(`PRESSURE: ${pressure} / 40`, width / 2, barY - 12);

  }, [localTimer, maxSeconds, pressure, isActive, pot]);

  return (
    <div className="crypto-chart">
      <canvas
        ref={canvasRef}
        width={1200}
        height={500}
        className="crypto-chart__canvas"
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
