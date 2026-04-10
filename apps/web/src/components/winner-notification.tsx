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

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        setTimeout(onClose, 500);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div 
      className={`winner-notification ${visible ? "winner-notification--visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
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
        
        <h2 id="winner-title" className="winner-notification__title">Cycle Resolved!</h2>
        
        <div className="winner-notification__winner">
          <span className="label">Winner</span>
          <strong className="value">{winner}</strong>
        </div>

        <div className="winner-notification__payout">
          <span className="label">Payout</span>
          <strong className="value">{payout} SOL</strong>
        </div>

        <div className="winner-notification__message">
          A new cycle is starting now.
        </div>

        <button
          className="winner-notification__close"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 500);
          }}
          aria-label="Close notification and continue"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
