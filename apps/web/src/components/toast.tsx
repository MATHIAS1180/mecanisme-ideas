"use client";

import { useEffect } from "react";
import "./toast.css";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [duration, onClose]);

  return (
    <>
      <div className="toast-backdrop" onClick={onClose} />
      <div className={`toast toast--${type}`} role="alert" aria-live="assertive">
        <div className="toast__content">
          {type === "success" && <span className="toast__icon" aria-hidden="true">✅</span>}
          {type === "error" && <span className="toast__icon" aria-hidden="true">❌</span>}
          {type === "info" && <span className="toast__icon" aria-hidden="true">ℹ️</span>}
          {type === "warning" && <span className="toast__icon" aria-hidden="true">⚠️</span>}
          <span className="toast__message">{message}</span>
        </div>
      </div>
    </>
  );
}
