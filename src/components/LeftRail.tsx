import { useMemo, useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { DISTRICT_LIST, DISTRICTS } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";

function hl(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--accent)] font-semibold">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function LeftRail() {
  const {
    query, setQuery,
    districtFilter, setDistrictFilter,
    selectedUnitId, setSelectedUnitId,
    focus, filteredUnits, pushToast,
  } = useApp();

  const [showSuggest, setShowSuggest] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return UNITS.filter((u) =>
      u.city.toLowerCase().includes(q) ||
      u.garrison.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [query]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setShowSuggest(false);
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
    pushToast("success", `Найдено: ${filteredUnits.length}`);
    setShowSuggest(false);
  };

  return (
    <aside className="w-[320px] shrink-0 h-full bg-[var(--panel)] border-r border-[var(--line)] flex flex-col">
      {/* Search */}
      <div ref={wrapRef} className="relative p-3 border-b border-[var(--line)]">
        <div className="relative">
          <Search size={14} strokeWidth={1.6} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
          <input
            className="input"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder="Номер, город или гарнизон"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowSuggest(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)] hover:text-[var(--text)]"
            >
              <X size={13} strokeWidth={1.6} />
            </button>
          )}
        </div>

        {showSuggest && suggestions.length > 0 && (
          <div className="absolute left-3 right-3 mt-1 bg-[var(--panel-2)] border border-[var(--line-2)] shadow-2xl z-50 max-h-[260px] overflow-auto scrollbar-thin">
            {suggestions.map((u) => {
              const d = DISTRICTS[u.district];
              return (
                <button
                  key={u.id}
                  onMouseDown={() => {
                    setSelectedUnitId(u.id);
                    focus({ kind: "unit", id: u.id });
                    setShowSuggest(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--panel-3)] border-b border-[var(--line)] last:border-b-0 flex items-center gap-2.5"
                >
                  <span className="w-0.5 self-stretch" style={{ background: d.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="mono text-[12px] font-bold text-[var(--text)]">
                      в/ч •••••
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] truncate">
                      {hl(u.city, query)} · {hl(u.garrison, query)}
                    </div>
                  </div>
                  <div className="label text-[9px]">{d.short}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* District tabs */}
      <div className="border-b border-[var(--line)]">
        <div className="px-3 pt-3 pb-1">
          <div className="label">Военный округ</div>
        </div>
        <div className="flex px-3 pb-0.5 gap-0.5">
          <button
            onClick={() => { setDistrictFilter(null); focus({ kind: "all" }); }}
            className={`dtab ${!districtFilter ? "active" : ""}`}
            style={!districtFilter ? { borderBottomColor: "var(--accent)" } : undefined}
          >
            Все
          </button>
          {DISTRICT_LIST.map((d) => {
            const active = districtFilter === d.code;
            return (
              <button
                key={d.code}
                onClick={() => { setDistrictFilter(active ? null : d.code); setSelectedUnitId(null); focus({ kind: active ? "all" : "district", id: d.code }); }}
                className={`dtab ${active ? "active" : ""}`}
                style={active ? { borderBottomColor: d.color, color: "var(--text)" } : undefined}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Units list header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div className="label">Поднадзорные объекты</div>
        <div className="mono text-[11px] text-[var(--text-dim)]">
          {filteredUnits.length} / {UNITS.length}
        </div>
      </div>

      {/* Units list */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {filteredUnits.length === 0 ? (
          <div className="px-4 py-10 text-center text-[12px] text-[var(--text-mute)]">
            Ничего не найдено
          </div>
        ) : (
          <div>
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
                  className={`row ${active ? "active" : ""}`}
                  style={{ borderLeftColor: active ? "var(--accent)" : d.color }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <div className="mono text-[13px] font-bold text-[var(--text)]">
                        в/ч •••••
                      </div>
                      <div className="label text-[9px]" style={{ color: d.color }}>{d.short}</div>
                    </div>
                    <div className="text-[11.5px] text-[var(--text-dim)] truncate mt-0.5">
                      {hl(u.city, query)}, {hl(u.garrison, query)} гар.
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
