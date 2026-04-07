import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastData {
  id: string; title?: string; description?: string; variant?: string;
}

let addToast: ((t: ToastData) => void) | null = null;

// Hook for triggering toasts from anywhere
export function useToast() {
  const toast = ({ title, description, variant }: Omit<ToastData, "id">) => {
    const t = { id: String(Date.now()), title, description, variant };
    addToast?.(t);
  };
  return { toast };
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToast = (t: ToastData) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
    };
    return () => { addToast = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          "rounded-lg border bg-background p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in-0",
          t.variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground"
        )}>
          {t.title && <div className="font-semibold text-sm">{t.title}</div>}
          {t.description && <div className="text-sm text-muted-foreground mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
