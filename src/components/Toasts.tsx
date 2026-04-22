import { useEffect } from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { useApp } from "../state";

const iconMap = { info: Info, success: CheckCircle2, warn: AlertTriangle, error: XCircle };
const colorMap = {
  info: "#4a90d9",
  success: "#4d9e73",
  warn: "#c9a961",
  error: "#c14b3a",
};

export function Toasts() {
  const { toasts, removeToast } = useApp();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => removeToast(t.id), 3500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[1000] flex flex-col gap-2 w-[320px]">
      {toasts.map((t) => {
        const Icon = iconMap[t.kind];
        const color = colorMap[t.kind];
        return (
          <div
            key={t.id}
            className="toast-enter pointer-events-auto flex items-start gap-3 bg-[var(--panel-2)] border px-3 py-2 shadow-xl"
            style={{ borderColor: color, borderLeftWidth: 3 }}
          >
            <Icon size={15} strokeWidth={1.6} style={{ color, marginTop: 1 }} />
            <div className="flex-1 text-[12.5px] leading-snug text-[var(--text)]">{t.text}</div>
            <button onClick={() => removeToast(t.id)} className="text-[var(--text-mute)] hover:text-[var(--text)]">
              <X size={13} strokeWidth={1.6} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
