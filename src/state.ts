import { createContext, useContext } from "react";
import type { DistrictCode, Unit } from "./types";

export interface ToastMsg {
  id: number;
  kind: "info" | "success" | "warn" | "error";
  text: string;
}

export interface AppState {
  query: string;
  setQuery: (v: string) => void;
  districtFilter: DistrictCode | null;
  setDistrictFilter: (v: DistrictCode | null) => void;
  selectedUnitId: string | null;
  setSelectedUnitId: (v: string | null) => void;
  focusTarget: { kind: "unit" | "district" | "all"; id?: string; ts: number } | null;
  focus: (t: { kind: "unit" | "district" | "all"; id?: string }) => void;
  toasts: ToastMsg[];
  pushToast: (kind: ToastMsg["kind"], text: string) => void;
  removeToast: (id: number) => void;
  filteredUnits: Unit[];
  resetAll: () => void;
}

export const AppCtx = createContext<AppState | null>(null);
export const useApp = () => {
  const v = useContext(AppCtx);
  if (!v) throw new Error("AppCtx missing");
  return v;
};
