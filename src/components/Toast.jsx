import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import styled from "styled-components";

const ToastWrapper = styled.div({
  position: "fixed",
  top: "1.25rem",
  right: "1.25rem",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  pointerEvents: "none",
});

const TOAST_COLORS = {
  success: { bg: "#166534", border: "#22c55e", icon: "checkmark" },
  error:   { bg: "#7f1d1d", border: "#ef4444", icon: "cross"    },
  info:    { bg: "#1e3a5f", border: "#3b82f6", icon: "info"     },
};

function ToastItem({ type, exiting, onClick, message }) {
  /* v8 ignore next */
  const c = TOAST_COLORS[type] || TOAST_COLORS.info;
  return (
    <div
      data-testid="toast-item"
      role="alert"
      onClick={onClick}
      style={{
        pointerEvents: "all",
        minWidth: "260px",
        maxWidth: "380px",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        fontSize: "0.875rem",
        lineHeight: "1.4",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.6rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        cursor: "pointer",
        background: c.bg,
        borderLeft: "4px solid " + c.border,
        color: "#f0f0f0",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateX(110%)" : "translateX(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <span data-testid={"toast-icon-" + c.icon} style={{ flexShrink: 0 }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "i"}
      </span>
      <span data-testid="toast-message" style={{ flex: 1, wordBreak: "break-word" }}>
        {message}
      </span>
    </div>
  );
}

export const ToastContext = createContext(null);

let _nextToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    timers.current["x" + id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current["x" + id];
    }, 260);
  }, []);

  const add = useCallback(
    (message, type, duration) => {
      const id = ++_nextToastId;
      const ms = duration !== undefined ? duration : type === "error" ? 5000 : 4000;
      /* v8 ignore next */
      setToasts((prev) => [...prev, { id, message, type: type || "info", exiting: false }]);
      if (ms > 0) {
        timers.current[id] = setTimeout(() => {
          dismiss(id);
          delete timers.current[id];
        }, ms);
      }
      return id;
    },
    [dismiss]
  );

  /* v8 ignore next */
  const toast = useCallback((msg, opts) => add(msg, "info", opts && opts.duration), [add]);
  toast.success = (msg, opts) => add(msg, "success", opts && opts.duration);
  toast.error   = (msg, opts) => add(msg, "error",   opts && opts.duration);
  toast.info    = (msg, opts) => add(msg, "info",    opts && opts.duration);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastWrapper aria-live="polite" aria-atomic="false">
        {toasts.map(({ id, message, type, exiting }) => (
          <ToastItem
            key={id}
            type={type}
            exiting={exiting}
            message={message}
            onClick={() => dismiss(id)}
          />
        ))}
      </ToastWrapper>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
