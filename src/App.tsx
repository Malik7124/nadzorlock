import { useCallback, useMemo, useRef, useState } from "react";
import { MapView } from "./components/MapView";
import { LeftRail } from "./components/LeftRail";
import { TopBar } from "./components/TopBar";
import { DetailPanel } from "./components/DetailPanel";
import { Toasts } from "./components/Toasts";
import { AppCtx, type ToastMsg } from "./state";
import { UNITS } from "./data/units";
import type { DistrictCode } from "./types";

export default function App() {
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState<DistrictCode | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ kind: "unit" | "district" | "all"; id?: string; ts: number } | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((kind: ToastMsg["kind"], text: string) => {
    setToasts((arr) => [...arr, { id: ++toastIdRef.current, kind, text }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);
  const focus = useCallback((t: { kind: "unit" | "district" | "all"; id?: string }) => {
    setFocusTarget({ ...t, ts: Date.now() });
  }, []);

  const filteredUnits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNITS.filter((u) => {
      if (districtFilter && u.district !== districtFilter) return false;
      if (!q) return true;
      return (
        u.number.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.garrison.toLowerCase().includes(q)
      );
    });
  }, [query, districtFilter]);

  const resetAll = useCallback(() => {
    setQuery("");
    setDistrictFilter(null);
    setSelectedUnitId(null);
    setFocusTarget({ kind: "all", ts: Date.now() });
    pushToast("info", "Состояние интерфейса сброшено");
  }, [pushToast]);

  return (
    <AppCtx.Provider
      value={{
        query, setQuery,
        districtFilter, setDistrictFilter,
        selectedUnitId, setSelectedUnitId,
        focusTarget, focus,
        toasts, pushToast, removeToast,
        filteredUnits, resetAll,
      }}
    >
      <div className="flex flex-col h-full w-full">
        <TopBar />
        <div className="flex-1 min-h-0 flex">
          <LeftRail />
          <main className="relative flex-1 h-full min-w-0">
            <MapView />
          </main>
          <DetailPanel />
        </div>
        <Toasts />
      </div>
    </AppCtx.Provider>
  );
}
