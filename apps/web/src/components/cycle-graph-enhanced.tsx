"use client";

import { useEffect, useState, useRef } from "react";
import "./cycle-graph-enhanced.css";

interface CycleGraphProps {
  remainingSeconds: number;
  maxSeconds: number;
  pressure: number;
  pot: string;
  leader: string;
  isActive: boolean;
}

interface Point {
  x: number;
  y: number;
  time: number;
  pressure: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function CycleGraphEnhanced({ remainingSeconds, maxSeconds, pressure, pot, leader, isActive }: CycleGraphProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [animatedPressure, setAnimatedPressure] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backgroundParticles, setBackgroundParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const lastPressureRef = useRef(pressure);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation de la pression
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPressure((prev) => {
        if (prev < pressure) return Math.min(prev + 0.5, pressure);
        if (prev > pressure) return Math.max(prev - 0.5, pressure);
        return prev;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [pressure]);

  // Particules de fond (étoiles)
  useEffect(() => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
    }));
    setBackgroundParticles(particles);
  }, []);

  // Détecte les augmentations de pression pour créer des particules explosives
  useEffect(() => {
    if (pressure > lastPressureRef.current) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 95,
        y: 100 - (pressure / 40) * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    }
    lastPressureRef.current = pressure;
  }, [pressure]);

  // Animation des particules explosives
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.5,
            y: p.y + p.vy * 0.5,
            vy: p.vy + 0.3, // Gravité
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0 && p.y < 105)
      );
    }, 30);
    
    return () => clearInterval(interval);
  }, [particles.length]);

  // Génération des points de la courbe
  useEffect(() => {
    const now = Date.now();
    const progress = maxSeconds > 0 ? remainingSeconds / maxSeconds : 0;
    const y = 100 - progress * 75 + 10; // 10-85 range
    
    setPoints((prev) => {
      const newPoints = [...prev, { x: 100, y, time: now, pressure }];
      const filtered = newPoints.filter((p) => now - p.time < 60000);
      return filtered.map((p, i) => ({
        ...p,
        x: (i / Math.max(filtered.length - 1, 1)) * 90,
      }));
    });
  }, [remainingSeconds, maxSeconds, pressure]);

  // Génère le path SVG avec courbe lissée (Catmull-Rom)
  const pathData = points.length > 1
    ? `M ${points[0].x},${points[0].y} ${points
        .slice(1)
        .map((p, i) => {
          const prev = points[i];
          const cpX = (prev.x + p.x) / 2;
          return `Q ${cpX},${prev.y} ${p.x},${p.y}`;
        })
        .join(" ")}`
    : "";

  // Couleur basée sur l'urgence avec transitions fluides
  const getColor = () => {
    if (remainingSeconds === 0) return { primary: "#ff006e", glow: "rgba(255, 0, 110, 0.8)" };
    if (remainingSeconds < 20) return { primary: "#ff4757", glow: "rgba(255, 71, 87, 0.7)" };
    if (remainingSeconds < 45) return { primary: "#ff6b35", glow: "rgba(255, 107, 53, 0.6)" };
    if (remainingSeconds < 90) return { primary: "#ffa502", glow: "rgba(255, 165, 2, 0.5)" };
    return { primary: "#00f5ff", glow: "rgba(0, 245, 255, 0.6)" };
  };

  const color = getColor();
  const progressPercent = maxSeconds > 0 ? (remainingSeconds / maxSeconds) * 100 : 0;
  const pressurePercent = (animatedPressure / 40) * 100;

  // Couleur de la barre de pression
  const getPressureColor = () => {
    if (pressurePercent >= 100) return { fill: "#ff006e", glow: "rgba(255, 0, 110, 0.8)" };
    if (pressurePercent >= 85) return { fill: "#ff4757", glow: "rgba(255, 71, 87, 0.7)" };
    if (pressurePercent >= 65) return { fill: "#ff6b35", glow: "rgba(255, 107, 53, 0.6)" };
    if (pressurePercent >= 40) return { fill: "#ffa502", glow: "rgba(255, 165, 2, 0.5)" };
    return { fill: "#39ff14", glow: "rgba(57, 255, 20, 0.6)" };
  };

  const pressureColor = getPressureColor();

  return (
    <div className="cycle-graph-enhanced">
      <div className="cycle-graph__header">
        <div className="cycle-graph__stat">
          <span className="label">💰 Pot</span>
          <strong className="value" style={{ color: "#39ff14" }}>{pot} SOL</strong>
        </div>
        <div className="cycle-graph__stat">
          <span className="label">⏱️ Timer</span>
          <strong className="value" style={{ color: color.primary }}>
            {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
          </strong>
        </div>
        <div className="cycle-graph__stat">
          <span className="label">⚡ Pressure</span>
          <strong className="value" style={{ color: pressureColor.fill }}>
            {pressure} / 40
          </strong>
        </div>
      </div>

      <div className="cycle-graph__canvas-container">
        <svg
          viewBox="0 0 100 100"
          className="cycle-graph__svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient principal avec animation */}
            <linearGradient id="graphGradientEnhanced" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color.primary} stopOpacity="0.4" />
              <stop offset="50%" stopColor={color.primary} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color.primary} stopOpacity="0.05" />
            </linearGradient>
            
            {/* Gradient de ligne avec effet néon */}
            <linearGradient id="lineGradientEnhanced" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color.primary} stopOpacity="0.4" />
              <stop offset="50%" stopColor={color.primary} stopOpacity="1" />
              <stop offset="100%" stopColor={color.primary} stopOpacity="1" />
            </linearGradient>
            
            {/* Filtre glow amélioré */}
            <filter id="glowEnhanced">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Filtre pour la barre de pression */}
            <filter id="pressureGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Pattern de grille */}
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
          </defs>

          {/* Grille de fond */}
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Particules de fond (étoiles) */}
          {backgroundParticles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill="rgba(255,255,255,0.3)"
              className="background-particle"
            />
          ))}

          {/* Lignes de grille horizontales */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="90"
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.3"
              strokeDasharray="3,3"
            />
          ))}

          {/* Zone sous la courbe avec gradient */}
          {points.length > 1 && (
            <path
              d={`${pathData} L ${points[points.length - 1].x},100 L 0,100 Z`}
              fill="url(#graphGradientEnhanced)"
              opacity="0.6"
            />
          )}

          {/* Ligne de la courbe avec effet néon */}
          {points.length > 1 && (
            <>
              {/* Ombre portée */}
              <path
                d={pathData}
                fill="none"
                stroke={color.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
                filter="url(#glowEnhanced)"
              />
              {/* Ligne principale */}
              <path
                d={pathData}
                fill="none"
                stroke="url(#lineGradientEnhanced)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glowEnhanced)"
              />
            </>
          )}

          {/* Points de pression (marqueurs) */}
          {points.filter((_, i) => i % 3 === 0).map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="0.8"
              fill={color.primary}
              opacity="0.6"
              filter="url(#glowEnhanced)"
            />
          ))}

          {/* Point actuel avec double pulsation */}
          {points.length > 0 && (
            <>
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4"
                fill={color.primary}
                opacity="0.2"
                className="cycle-graph__pulse-outer-enhanced"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="2.5"
                fill={color.primary}
                opacity="0.4"
                className="cycle-graph__pulse-mid-enhanced"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="1.5"
                fill={color.primary}
                filter="url(#glowEnhanced)"
              />
            </>
          )}

          {/* Barre de pression avec effet liquide */}
          <g transform="translate(93, 0)">
            {/* Fond de la barre avec bordure */}
            <rect
              x="0"
              y="0"
              width="5"
              height="100"
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.3"
              rx="2.5"
            />
            
            {/* Segments de danger (zones) */}
            <rect x="0" y="0" width="5" height="15" fill="rgba(255, 0, 110, 0.15)" rx="2.5" />
            <rect x="0" y="15" width="5" height="20" fill="rgba(255, 107, 53, 0.12)" rx="2.5" />
            <rect x="0" y="35" width="5" height="25" fill="rgba(255, 165, 2, 0.1)" rx="2.5" />
            
            {/* Barre de pression remplie avec effet liquide */}
            <rect
              x="0"
              y={100 - pressurePercent}
              width="5"
              height={pressurePercent}
              fill={pressureColor.fill}
              rx="2.5"
              className="cycle-graph__pressure-bar-enhanced"
              filter="url(#pressureGlow)"
            />
            
            {/* Effet de brillance sur la barre */}
            <rect
              x="0.5"
              y={100 - pressurePercent}
              width="2"
              height={pressurePercent * 0.3}
              fill="rgba(255,255,255,0.3)"
              rx="1"
              className="pressure-shine"
            />
            
            {/* Indicateur terminal lock */}
            {pressurePercent >= 100 && (
              <>
                <rect
                  x="-1"
                  y="-1"
                  width="7"
                  height="102"
                  fill="none"
                  stroke="#ff006e"
                  strokeWidth="0.5"
                  rx="3"
                  className="terminal-lock-border"
                />
                <text
                  x="8"
                  y="8"
                  fontSize="4"
                  fill="#ff006e"
                  fontWeight="bold"
                  filter="url(#glowEnhanced)"
                >
                  LOCK
                </text>
              </>
            )}
            
            {/* Marqueurs de niveau */}
            {[25, 50, 75, 100].map((level) => (
              <line
                key={level}
                x1="5"
                y1={100 - level}
                x2="7"
                y2={100 - level}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.3"
              />
            ))}
          </g>

          {/* Particules explosives */}
          {particles.map((particle) => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={1.2}
              fill={pressureColor.fill}
              opacity={particle.life}
              filter="url(#glowEnhanced)"
            />
          ))}
        </svg>
      </div>

      <div className="cycle-graph__footer">
        <div className="cycle-graph__leader">
          <span className="label">👑 Current Leader</span>
          <strong className="value">{leader}</strong>
        </div>
        <div className="cycle-graph__progress">
          <div className="progress-bar-enhanced">
            <div
              className="progress-bar__fill-enhanced"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: color.primary,
                boxShadow: `0 0 20px ${color.glow}`,
              }}
            >
              <div className="progress-bar__shine" />
            </div>
          </div>
          <div className="progress-labels">
            <span>0s</span>
            <span className="progress-current">{remainingSeconds}s</span>
            <span>{Math.floor(maxSeconds)}s</span>
          </div>
        </div>
      </div>

      {!isActive && (
        <div className="cycle-graph__overlay-enhanced">
          <div className="cycle-graph__overlay-content-enhanced">
            <div className="cycle-graph__overlay-icon-enhanced">⏱️</div>
            <span className="overlay-title">Cycle Terminé</span>
            <small className="overlay-subtitle">En attente de résolution...</small>
            <div className="overlay-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
