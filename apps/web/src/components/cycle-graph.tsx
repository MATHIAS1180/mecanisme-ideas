"use client";

import { useEffect, useState, useRef } from "react";

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
  pot: number;
}

export function CycleGraph({ remainingSeconds, maxSeconds, pressure, pot, leader, isActive }: CycleGraphProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [animatedPressure, setAnimatedPressure] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const lastPressureRef = useRef(pressure);
  const lastPotRef = useRef(parseFloat(pot));

  // Animation de la pression
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPressure((prev) => {
        if (prev < pressure) return Math.min(prev + 1, pressure);
        if (prev > pressure) return Math.max(prev - 1, pressure);
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [pressure]);

  // Détecte les augmentations de pression pour créer des particules
  useEffect(() => {
    if (pressure > lastPressureRef.current) {
      const newParticles = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        x: 95 + Math.random() * 2,
        y: 100 - (pressure / 40) * 100 + Math.random() * 10,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 1000);
    }
    lastPressureRef.current = pressure;
  }, [pressure]);

  // Génération des points de la courbe basée sur le pot
  useEffect(() => {
    const now = Date.now();
    const currentPot = parseFloat(pot);
    
    // Trouve le pot maximum dans l'historique pour normaliser
    const maxPot = Math.max(currentPot, ...points.map(p => p.pot), 0.1);
    const y = 100 - (currentPot / maxPot) * 80; // 20-100 range (0 SOL en bas, max en haut)
    
    setPoints((prev) => {
      const newPoints = [...prev, { x: 100, y, time: now, pot: currentPot }];
      // Garde seulement les 100 derniers points (au lieu de 60)
      const filtered = newPoints.slice(-100);
      // Recalcule les positions x pour étaler sur toute la largeur
      return filtered.map((p, i) => ({
        ...p,
        x: (i / Math.max(filtered.length - 1, 1)) * 92, // 92 pour laisser place à la barre de pression
      }));
    });
    
    lastPotRef.current = currentPot;
  }, [pot, points]);

  // Génère le path SVG avec courbe lissée
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

  // Couleur verte fixe
  const color = "#00d2d3";
  
  // Couleur du timer basée sur l'urgence
  const getTimerColor = () => {
    if (remainingSeconds === 0) return "#ff4757";
    if (remainingSeconds < 30) return "#ffa502";
    if (remainingSeconds < 60) return "#ffb100";
    return "#00d2d3";
  };

  const timerColor = getTimerColor();
  const progressPercent = maxSeconds > 0 ? (remainingSeconds / maxSeconds) * 100 : 0;
  const pressurePercent = (animatedPressure / 40) * 100;
  
  // Calcule le pot max et min pour les labels
  const maxPotValue = Math.max(parseFloat(pot), ...points.map(p => p.pot), 0.1);
  const minPotValue = 0;

  return (
    <div className="cycle-graph">
      <div className="cycle-graph__header">
        <div className="cycle-graph__stat">
          <span className="label">Pot</span>
          <strong className="value" style={{ color: "#00d2d3" }}>{pot} SOL</strong>
        </div>
        <div className="cycle-graph__stat">
          <span className="label">Timer</span>
          <strong className="value" style={{ color: timerColor }}>
            {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
          </strong>
        </div>
        <div className="cycle-graph__stat">
          <span className="label">Pressure</span>
          <strong className="value" style={{ color: pressurePercent >= 100 ? "#ff4757" : pressurePercent >= 75 ? "#ffa502" : "#00d2d3" }}>
            {pressure} / 40
          </strong>
        </div>
      </div>

      <svg
        viewBox="0 0 100 100"
        className="cycle-graph__svg"
        preserveAspectRatio="none"
      >
        {/* Grille de fond */}
        <defs>
          <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Lignes de grille horizontales */}
        {[20, 40, 60, 80].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="92"
            y2={y}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.2"
            strokeDasharray="2,2"
          />
        ))}

        {/* Labels de l'axe Y (SOL) */}
        <text x="-2" y="102" fontSize="3" fill="rgba(255,255,255,0.4)" textAnchor="end">
          {minPotValue.toFixed(2)}
        </text>
        <text x="-2" y="22" fontSize="3" fill="rgba(255,255,255,0.4)" textAnchor="end">
          {maxPotValue.toFixed(2)}
        </text>
        <text x="-2" y="12" fontSize="2.5" fill="rgba(255,255,255,0.3)" textAnchor="end">
          SOL
        </text>

        {/* Zone sous la courbe */}
        {points.length > 1 && (
          <path
            d={`${pathData} L ${points[points.length - 1].x},100 L 0,100 Z`}
            fill="url(#graphGradient)"
          />
        )}

        {/* Ligne de la courbe */}
        {points.length > 1 && (
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {/* Points de pression (marqueurs visuels) */}
        {points.filter((_, i) => i % 10 === 0).map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.5"
            fill={color}
            opacity="0.4"
          />
        ))}

        {/* Point actuel pulsant */}
        {points.length > 0 && (
          <>
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="2.5"
              fill={color}
              opacity="0.3"
              className="cycle-graph__pulse-outer"
            />
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="1.5"
              fill={color}
              filter="url(#glow)"
            />
          </>
        )}

        {/* Barre de pression avec segments */}
        <g transform="translate(95, 0)">
          {/* Fond de la barre */}
          <rect
            x="0"
            y="0"
            width="4"
            height="100"
            fill="rgba(255,255,255,0.05)"
            rx="2"
          />
          {/* Segments de danger */}
          <rect
            x="0"
            y="0"
            width="4"
            height="25"
            fill="rgba(255, 71, 87, 0.1)"
            rx="2"
          />
          <rect
            x="0"
            y="25"
            width="4"
            height="25"
            fill="rgba(255, 165, 2, 0.1)"
            rx="2"
          />
          {/* Barre de pression remplie */}
          <rect
            x="0"
            y={100 - pressurePercent}
            width="4"
            height={pressurePercent}
            fill={pressurePercent >= 100 ? "#ff4757" : pressurePercent >= 75 ? "#ffa502" : color}
            rx="2"
            className="cycle-graph__pressure-bar"
            filter="url(#glow)"
          />
          {/* Indicateur terminal lock */}
          {pressurePercent >= 100 && (
            <text
              x="7"
              y="5"
              fontSize="3"
              fill="#ff4757"
              fontWeight="bold"
            >
              LOCK
            </text>
          )}
        </g>

        {/* Particules d'augmentation de pression */}
        {particles.map((particle) => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r="0.8"
            fill={color}
            className="cycle-graph__particle"
          />
        ))}
      </svg>

      <div className="cycle-graph__footer">
        <div className="cycle-graph__leader">
          <span className="label">Current Leader</span>
          <strong className="value">{leader}</strong>
        </div>
        <div className="cycle-graph__progress">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: timerColor,
              }}
            />
          </div>
          <div className="progress-labels">
            <span>0s</span>
            <span>{Math.floor(maxSeconds)}s</span>
          </div>
        </div>
      </div>

      {!isActive && (
        <div className="cycle-graph__overlay">
          <div className="cycle-graph__overlay-content">
            <div className="cycle-graph__overlay-icon">⏱️</div>
            <span>Cycle Terminé</span>
            <small>En attente de résolution</small>
          </div>
        </div>
      )}
    </div>
  );
}
