"use client";

import { useEffect, useRef } from "react";
import "./cycle-graph-pro.css";

interface CycleGraphProProps {
  remainingSeconds: number;
  maxSeconds: number;
  pressure: number;
  pot: string;
  leader: string;
  isActive: boolean;
}

export function CycleGraphPro({
  remainingSeconds,
  maxSeconds,
  pressure,
  pot,
  leader,
  isActive,
}: CycleGraphProProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#0a1628");
    bgGradient.addColorStop(1, "#050b14");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Progress calculation
    const progress = maxSeconds > 0 ? remainingSeconds / maxSeconds : 0;
    const barHeight = height * 0.6;
    const barY = (height - barHeight) / 2;
    const barWidth = width * 0.9;
    const barX = (width - barWidth) / 2;

    // Background bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress bar with gradient
    const progressWidth = barWidth * progress;
    const progressGradient = ctx.createLinearGradient(barX, 0, barX + progressWidth, 0);
    
    if (progress > 0.5) {
      progressGradient.addColorStop(0, "#00ff88");
      progressGradient.addColorStop(1, "#00cc6a");
    } else if (progress > 0.2) {
      progressGradient.addColorStop(0, "#ffaa00");
      progressGradient.addColorStop(1, "#ff8800");
    } else {
      progressGradient.addColorStop(0, "#ff4444");
      progressGradient.addColorStop(1, "#cc0000");
    }

    ctx.fillStyle = progressGradient;
    ctx.fillRect(barX, barY, progressWidth, barHeight);

    // Glow effect
    if (isActive && progress > 0) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = progress > 0.5 ? "#00ff88" : progress > 0.2 ? "#ffaa00" : "#ff4444";
      ctx.fillRect(barX, barY, progressWidth, barHeight);
      ctx.shadowBlur = 0;
    }

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Pressure indicator (small dots)
    const maxPressure = 40;
    const dotCount = Math.min(pressure, maxPressure);
    const dotSpacing = barWidth / maxPressure;
    
    for (let i = 0; i < dotCount; i++) {
      const x = barX + i * dotSpacing + dotSpacing / 2;
      const y = barY - 15;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = i < pressure ? "#ff6b6b" : "rgba(255, 255, 255, 0.1)";
      ctx.fill();
    }

    // Timer text
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    
    ctx.font = "bold 48px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(timeText, width / 2, height / 2);

  }, [remainingSeconds, maxSeconds, pressure, isActive]);

  return (
    <div className="cycle-graph-pro">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="cycle-graph-pro__canvas"
      />
      <div className="cycle-graph-pro__info">
        <div className="cycle-graph-pro__stat">
          <span className="cycle-graph-pro__label">POT</span>
          <span className="cycle-graph-pro__value">{pot} SOL</span>
        </div>
        <div className="cycle-graph-pro__stat">
          <span className="cycle-graph-pro__label">LEADER</span>
          <span className="cycle-graph-pro__value">{leader}</span>
        </div>
        <div className="cycle-graph-pro__stat">
          <span className="cycle-graph-pro__label">PRESSURE</span>
          <span className="cycle-graph-pro__value">{pressure} / 40</span>
        </div>
      </div>
    </div>
  );
}
