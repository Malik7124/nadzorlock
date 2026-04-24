import { useMemo, useState, useRef, useEffect } from "react";
import { Search, X, RotateCcw, ChevronRight, MapPin, Shield } from "lucide-react";
import { DISTRICT_LIST, DISTRICTS } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";
import { SelectionPanel } from "./SelectionPanel";

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-400/30 text-amber-100 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Sidebar() {
  const {
    query, setQuery,
    districtFilter, setDistrictFilter,
    selectedUnitId, setSelectedUnitId,
    focus, filteredUnits, resetAll, pushToast,
  } = useApp();

  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return UNITS.filter((u) =>
      u.city.toLowerCase().includes(q) ||
      u.garrison.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!inputRef.current?.parentElement?.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const submitSearch = () => {
    if (!query.trim()) return;
    if (filteredUnits.length === 0) {
      pushToast("warn", `По запросу «${query}» ничего не найдено`);
      return;
    }
    const first = filteredUnits[0];
    setSelectedUnitId(first.id);
    focus({ kind: "unit", id: first.id });
    pushToast("success", `Найдено ${filteredUnits.length} — переход к ${first.city}`);
    setShowSuggest(false);
  };

  return (
    <aside className="w-[400px] shrink-0 h-full bg-slate-950/80 border-r border-slate-800 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Система</div>
          <div className="font-bold text-white text-lg leading-tight">НАДЗОРЛОК</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-3 relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder="Поиск: 50002, Казань, Владивостокский..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-16 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowSuggest(false); }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
              title="Очистить"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={resetAll}
            title="Сбросить все фильтры"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {showSuggest && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            {suggestions.map((u) => (
              <button
                key={u.id}
                onMouseDown={() => {
                  setSelectedUnitId(u.id);
                  focus({ kind: "unit", id: u.id });
                  setShowSuggest(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5 border-b border-slate-800 last:border-b-0"
              >
                <span
                  className="inline-block w-1 h-8 rounded-sm"
                  style={{ background: DISTRICTS[u.district].color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-mono font-semibold text-white">
                    в/ч •••••
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {highlight(u.city, query)} · {highlight(u.garrison, query)} гарнизон
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Districts chip strip */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        <button
          onClick={() => { setDistrictFilter(null); focus({ kind: "all" }); }}
          className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
            !districtFilter ? "bg-slate-100 text-slate-900 border-slate-100" : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
          }`}
        >
          Все
        </button>
        {DISTRICT_LIST.map((d) => {
          const active = districtFilter === d.code;
          return (
            <button
              key={d.code}
              onClick={() => { setDistrictFilter(active ? null : d.code); setSelectedUnitId(null); focus({ kind: active ? "all" : "district", id: d.code }); }}
              className="text-[11px] px-2.5 py-1 rounded-md border transition"
              style={{
                background: active ? d.color : "#0f172a",
                color: active ? "#fff" : "#cbd5e1",
                borderColor: active ? d.color : "#334155",
              }}
            >
              {d.short}
            </button>
          );
        })}
      </div>

      {/* Selection panel */}
      <div className="px-4 pb-3">
        <SelectionPanel />
      </div>

      {/* Units list */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Поднадзорные объекты
        </div>
        <span className="text-[11px] rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-slate-300 font-mono">
          {filteredUnits.length} / {UNITS.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-3 pb-4">
        {filteredUnits.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            Ничего не найдено
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredUnits.map((u) => {
              const d = DISTRICTS[u.district];
              const active = selectedUnitId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUnitId(u.id);
                    focus({ kind: "unit", id: u.id });
                  }}
                  className={`group text-left rounded-lg px-3 py-2 border flex items-center gap-3 transition ${
                    active
                      ? "bg-slate-800 border-slate-600"
                      : "bg-slate-900/50 border-transparent hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <span
                    className="w-1 self-stretch rounded-sm shrink-0"
                    style={{ background: d.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <div className="font-mono text-sm font-bold text-white">
                        •••••
                      </div>
                      <div className="text-[10px] uppercase text-slate-500 tracking-wider">
                        {d.short}
                      </div>
                    </div>
                    <div className="text-[12px] text-slate-400 truncate">
                      <MapPin size={10} className="inline mr-1 -mt-0.5" />
                      {highlight(u.city, query)} · {highlight(u.garrison, query)}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
