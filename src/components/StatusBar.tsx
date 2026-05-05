import { Layers, MapPin, Target } from "lucide-react";
import { DISTRICTS } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";
import { MASK } from "../utils/mask";

export function StatusBar() {
  const { selectedUnitId, districtFilter, filteredUnits } = useApp();
  const selectedUnit = UNITS.find((u) => u.id === selectedUnitId);
  const selectionLabel = selectedUnit
    ? `в/ч ${MASK}`
    : districtFilter
    ? DISTRICTS[districtFilter].short
    : "—";

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex gap-2">
      <Chip icon={Layers} label="Округа" value="5" />
      <Chip icon={MapPin} label="Объекты" value={`${filteredUnits.length} / ${UNITS.length}`} />
      <Chip icon={Target} label="Выбор" value={selectionLabel} accent={selectedUnit ? DISTRICTS[selectedUnit.district].color : districtFilter ? DISTRICTS[districtFilter].color : undefined} />
    </div>
  );
}

function Chip({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border backdrop-blur px-3 py-1.5 shadow-lg"
         style={{ background: "color-mix(in srgb, var(--panel-2) 85%, transparent)", borderColor: "var(--line-2)" }}>
      <Icon size={14} style={{ color: accent ?? "var(--text-mute)" }} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{value}</span>
      </div>
    </div>
  );
}
