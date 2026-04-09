"use client";

import { useEffect, useState } from "react";
import "./winner-notification.css";

interface WinnerNotificationProps {
  winner: string;
  payout: string;
  onClose: () => void;
}

export function WinnerNotification({ winner, payout, onClose }: WinnerNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setVisible(true), 100);
    
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`winner-notification ${visible ? "winner-notification--visible" : ""}`}>
      <div className="winner-notification__content">
        <div className="winner-notification__confetti">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: [
                  "#8cf5c5",
                  "#7dd3ff",
                  "#ffc86e",
                  "#ff8b87",
                  "#39ff14",
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>

        <div className="winner-notification__icon">🏆</div>
        
        <h2 className="winner-notification__title">Cycle Terminé !</h2>
        
        <div className="winner-notification__winner">
          <span className="label">Gagnant</span>
          <strong className="value">{winner}</strong>
        </div>

        <div className="winner-notification__payout">
          <span className="label">Gains</span>
          <strong className="value">{payout} SOL</strong>
        </div>

        <div className="winner-notification__message">
          Un nouveau cycle commence maintenant !
        </div>

        <button
          className="winner-notification__close"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 500);
          }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
