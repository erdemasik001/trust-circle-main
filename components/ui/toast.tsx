"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "loading" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  txHash?: string;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, txHash?: string) => string;
  dismiss: (id: string) => void;
  update: (id: string, message: string, variant: ToastVariant, txHash?: string) => void;
}

// ─── Context ────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success", txHash?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant, txHash }]);

    if (variant !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const update = useCallback((id: string, message: string, variant: ToastVariant, txHash?: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message, variant, txHash } : t)),
    );

    if (variant !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }
  }, []);

  const icons: Record<ToastVariant, ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
    loading: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  };

  const borderColors: Record<ToastVariant, string> = {
    success: "border-green-200 dark:border-green-900",
    error: "border-red-200 dark:border-red-900",
    loading: "border-blue-200 dark:border-blue-900",
    warning: "border-yellow-200 dark:border-yellow-900",
  };

  return (
    <ToastContext value={{ toast, dismiss, update }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex w-full items-center gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm ${borderColors[t.variant]}`}
              onClick={() => dismiss(t.id)}
            >
              {icons[t.variant]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.message}</p>
                {t.txHash && (
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground truncate">
                    tx: {t.txHash.slice(0, 10)}...{t.txHash.slice(-6)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}
