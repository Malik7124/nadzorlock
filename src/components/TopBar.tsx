import { RotateCcw, Sun, Moon } from "lucide-react";
import { DISTRICTS } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";
import { Emblem } from "./Emblem";
import { MASK } from "../utils/mask";
import { useTheme } from "../hooks/useTheme";

export function TopBar() {
  const { selectedUnitId, districtFilter, filteredUnits, resetAll } = useApp();
  const [theme, toggleTheme] = useTheme();
  const selectedUnit = UNITS.find((u) => u.id === selectedUnitId);

  const selectionLabel = selectedUnit
    ? `в/ч ${MASK}`
    : districtFilter
    ? DISTRICTS[districtFilter].short
    : "—";
  const selectionAccent = selectedUnit
    ? DISTRICTS[selectedUnit.district].color
    : districtFilter
    ? DISTRICTS[districtFilter].color
    : "var(--text-mute)";

  return (
    <header className="h-14 shrink-0 flex items-center border-b border-[var(--line)] bg-[var(--panel)]">
      {/* Brand */}
      <div className="h-full flex items-center gap-3 px-5 border-r border-[var(--line)]">
        <Emblem size={28} />
        <div className="flex flex-col leading-none">
          <div className="text-[9px] tracking-[0.3em] text-[var(--text-mute)] font-semibold">
            ИНФОРМАЦИОННАЯ СИСТЕМА
          </div>
          <div className="text-[15px] font-bold tracking-[0.18em] text-[var(--text)] mt-0.5">
            Н А Д З О Р Л О К
          </div>
        </div>
      </div>

      <div className="px-5 text-[11px] text-[var(--text-dim)] border-r border-[var(--line)] h-full flex items-center">
        <div className="leading-tight">
          <div className="label">Назначение</div>
          <div className="text-[var(--text)] text-[12px]">Карта поднадзорных воинских частей</div>
        </div>
      </div>

      {/* Status blocks */}
      <div className="flex-1 h-full flex items-center gap-0">
        <StatBlock label="Округов" value="5" />
        <StatBlock label="Объектов в выборке" value={`${filteredUnits.length} / ${UNITS.length}`} />
        <StatBlock label="Активный выбор" value={selectionLabel} accent={selectionAccent as string} />
      </div>

      {/* Theme + Reset */}
      <div className="h-full flex items-center px-4 gap-1 border-l border-[var(--line)]">
        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
        >
          {theme === "dark"
            ? <Sun size={13} strokeWidth={1.6} />
            : <Moon size={13} strokeWidth={1.6} />}
        </button>
        <button
          className="btn btn-ghost"
          onClick={resetAll}
          title="Сбросить все фильтры и выбор"
        >
          <RotateCcw size={13} strokeWidth={1.6} />
          Сброс
        </button>
      </div>
    </header>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="h-full flex items-center gap-3 px-5 border-r border-[var(--line)]">
      <div className="leading-tight">
        <div className="label">{label}</div>
        <div
          className="mono text-[13px] font-semibold mt-0.5"
          style={{ color: accent ?? "var(--text)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
