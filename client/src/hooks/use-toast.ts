import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let listeners: Array<(t: Toast) => void> = [];

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant }: Omit<Toast, "id">) => {
    const t: Toast = { id: String(Date.now()), title, description, variant };
    setToasts(prev => [...prev, t]);
    listeners.forEach(l => l(t));
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

// Global toast store for Toaster component
let globalToasts: Toast[] = [];
let globalSetToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function useToastStore() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  globalSetToasts = setToasts;

  // Register listener
  useState(() => {
    const listener = (t: Toast) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3000);
    };
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  });

  return toasts;
}
