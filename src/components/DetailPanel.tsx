import { X, Crosshair, Shield, MapPin, Users, Gavel, Layers } from "lucide-react";
import { DISTRICTS } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";

function KV({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="section-title">
        <Icon size={12} strokeWidth={1.8} />
        {title}
      </div>
      <dl className="kv">{children}</dl>
    </div>
  );
}

export function DetailPanel() {
  const { selectedUnitId, setSelectedUnitId, districtFilter, setDistrictFilter, focus, filteredUnits } = useApp();

  const hasSelection = !!selectedUnitId || !!districtFilter;
  if (!hasSelection) return null;

  return (
    <aside
      key={selectedUnitId ?? districtFilter}
      className="drawer-enter w-[440px] shrink-0 h-full bg-[var(--panel)] border-l border-[var(--line)] flex flex-col"
    >
      {selectedUnitId ? <UnitView /> : <DistrictView />}
    </aside>
  );

  function UnitView() {
    const u = UNITS.find((x) => x.id === selectedUnitId);
    if (!u) return null;
    const d = DISTRICTS[u.district];
    return (
      <>
        {/* Header */}
        <div className="relative border-b border-[var(--line)]">
          <div className="h-[3px]" style={{ background: d.color }} />
          <div className="p-5">
            <button
              onClick={() => setSelectedUnitId(null)}
              className="absolute top-4 right-4 text-[var(--text-mute)] hover:text-[var(--text)]"
              title="Закрыть"
            >
              <X size={16} strokeWidth={1.6} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className="mono text-[10px] font-bold px-1.5 py-0.5 border"
                style={{ color: d.color, borderColor: d.color }}
              >
                {d.short}
              </span>
              <span className="label">Карточка воинской части</span>
            </div>

            <div className="mono text-[28px] font-bold tracking-tight leading-none text-[var(--text)]">
              в/ч {u.number}
            </div>
            <div className="text-[13px] text-[var(--text-dim)] mt-2 leading-snug">
              {u.fullName}
            </div>
            <div className="text-[11px] text-[var(--text-mute)] mt-1">
              {u.garrison} гарнизон · {d.name}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn" onClick={() => focus({ kind: "unit", id: u.id })}>
                <Crosshair size={12} strokeWidth={1.8} />
                Показать на карте
              </button>
              <StatusBadge status={u.status} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          <Section icon={Shield} title="Идентификация">
            <KV k="Условный номер" v={`в/ч ${u.number}`} />
            <KV k="Наименование" v={u.fullName} />
            <KV k="Род войск / тип" v={u.branch} />
            <KV k="Подчинённость" v={u.subordination} />
            <KV k="Почётные наименования" v={u.honors} />
          </Section>

          <Section icon={MapPin} title="Дислокация">
            <KV k="Субъект РФ" v={u.region} />
            <KV k="Населённый пункт" v={u.city} />
            <KV k="Почтовый адрес" v={u.address} />
            <KV k="Индекс" v={u.postalIndex} />
            <KV k="Координаты" v={`${u.coords[0].toFixed(4)}, ${u.coords[1].toFixed(4)}`} />
          </Section>

          <Section icon={Users} title="Командование и связь">
            <KV k="Командир" v={u.commander} />
            <KV k="Начальник штаба" v={u.chiefOfStaff} />
            <KV k="Телефон дежурного" v={u.dutyPhone} />
          </Section>

          <Section icon={Gavel} title="Прокурорский надзор">
            <KV k="Военная прокуратура" v={u.prosecutorOffice} />
            <KV k="Военный прокурор" v={u.prosecutor} />
            <KV k="Адрес прокуратуры" v={u.prosecutorAddress} />
            <KV k="Телефон" v={u.prosecutorPhone} />
            <KV k="E-mail" v={u.prosecutorEmail} />
            <KV k="На надзоре с" v={u.supervisionSince} />
            <KV k="№ надзорного производства" v={u.caseNumber} />
          </Section>

          {u.formed && (
            <Section icon={Layers} title="Историческая справка">
              <KV k="Дата формирования" v={u.formed} />
            </Section>
          )}
        </div>
      </>
    );
  }

  function DistrictView() {
    const d = DISTRICTS[districtFilter!];
    const unitsInDistrict = filteredUnits.filter((u) => u.district === d.code);
    return (
      <>
        <div className="relative border-b border-[var(--line)]">
          <div className="h-[3px]" style={{ background: d.color }} />
          <div className="p-5">
            <button
              onClick={() => setDistrictFilter(null)}
              className="absolute top-4 right-4 text-[var(--text-mute)] hover:text-[var(--text)]"
            >
              <X size={16} strokeWidth={1.6} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className="mono text-[10px] font-bold px-1.5 py-0.5 border"
                style={{ color: d.color, borderColor: d.color }}
              >
                {d.short}
              </span>
              <span className="label">Карточка военного округа</span>
            </div>

            <div className="text-[20px] font-bold leading-tight text-[var(--text)]">
              {d.name}
            </div>
            <div className="text-[12px] text-[var(--text-dim)] mt-1">
              Штаб: {d.hq}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn" onClick={() => focus({ kind: "district", id: d.code })}>
                <Crosshair size={12} strokeWidth={1.8} />
                Сфокусировать карту
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Гарнизонов" value={String(d.garrisons?.length ?? 0)} />
              <MiniStat label="Поднадзорных частей" value={String(unitsInDistrict.length)} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          <Section icon={MapPin} title="Зона ответственности">
            <KV k="Субъекты РФ" v={d.regions} />
            <KV k="Общая площадь" v={d.area} />
          </Section>

          <Section icon={Users} title="Руководство">
            <KV k="Командующий" v={d.commander} />
            <KV k="Начальник штаба" v={d.chiefOfStaff} />
          </Section>

          <Section icon={Gavel} title="Прокурорский надзор">
            <KV k="Военная прокуратура" v={d.prosecutorOffice} />
            <KV k="Военный прокурор" v={d.prosecutor} />
            <KV k="Адрес" v={d.prosecutorAddress} />
            <KV k="Телефон" v={d.prosecutorPhone} />
            <KV k="E-mail" v={d.prosecutorEmail} />
          </Section>

          {d.garrisons && d.garrisons.length > 0 && (
            <Section icon={Layers} title="Гарнизоны">
              <dt className="col-span-2 text-[var(--text)]">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {d.garrisons.map((g) => (
                    <span key={g} className="text-[11px] px-2 py-0.5 border border-[var(--line-2)] bg-[var(--panel-2)] text-[var(--text-dim)]">
                      {g}
                    </span>
                  ))}
                </div>
              </dt>
            </Section>
          )}
        </div>
      </>
    );
  }
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line-2)] bg-[var(--panel-2)] px-3 py-2">
      <div className="label text-[9px]">{label}</div>
      <div className="mono text-[18px] font-bold text-[var(--text)] mt-0.5">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "reformed" | "disbanded" }) {
  const cfg = {
    active: { label: "Действующая", color: "#4d9e73" },
    reformed: { label: "Переформирована", color: "#c9a961" },
    disbanded: { label: "Расформирована", color: "#c14b3a" },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] uppercase font-semibold px-2 py-1 border"
      style={{ color: cfg.color, borderColor: cfg.color }}
    >
      <span className="w-1.5 h-1.5" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}
