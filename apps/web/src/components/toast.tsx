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
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__content">
        {type === "success" && <span className="toast__icon">✅</span>}
        {type === "error" && <span className="toast__icon">❌</span>}
        {type === "info" && <span className="toast__icon">ℹ️</span>}
        {type === "warning" && <span className="toast__icon">⚠️</span>}
        <span className="toast__message">{message}</span>
      </div>
    </div>
  );
}
