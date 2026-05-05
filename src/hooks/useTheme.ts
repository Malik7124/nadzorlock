import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "nadzorlock-theme";

function read(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function apply(t: Theme) {
  document.documentElement.dataset.theme = t;
}

// Глобальная шина — чтобы переключение темы в одном компоненте
// перерисовало все остальные подписчики useTheme().
const listeners = new Set<(t: Theme) => void>();

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    apply(theme);
    const fn = (t: Theme) => setTheme(t);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    apply(next);
    listeners.forEach((fn) => fn(next));
  };

  return [theme, toggle];
}

// Применяем тему как можно раньше, до первого рендера —
// иначе будет вспышка тёмного фона при включённой светлой.
if (typeof document !== "undefined") {
  apply(read());
}
