import { MapPin, Building2, Shield, Phone, Mail, User, Hash, Calendar, Award, Crosshair, X } from "lucide-react";
import { DISTRICTS } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-[13px]">
      <Icon size={14} className="mt-0.5 text-slate-400 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-slate-200 break-words">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-800 pt-3 mt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function SelectionPanel() {
  const { selectedUnitId, setSelectedUnitId, districtFilter, setDistrictFilter, focus, filteredUnits } = useApp();

  if (!selectedUnitId && !districtFilter) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4 text-center text-sm text-slate-500">
        Выберите военный округ или воинскую часть на карте либо в списке
      </div>
    );
  }

  if (selectedUnitId) {
    const u = UNITS.find((x) => x.id === selectedUnitId);
    if (!u) return null;
    const d = DISTRICTS[u.district];
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 overflow-hidden">
        <div className="p-4 relative" style={{ background: `linear-gradient(135deg, ${d.color}33 0%, transparent 80%)` }}>
          <button
            onClick={() => setSelectedUnitId(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: d.color, color: "#fff" }}>
              <Shield size={11} /> {d.short}
            </span>
            <span className="text-[11px] text-slate-400">{u.garrison} гарнизон</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-white">
            в/ч •••••
          </div>
          <div className="text-sm text-slate-300 leading-snug mt-0.5">{u.fullName}</div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => focus({ kind: "unit", id: u.id })}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/10 rounded-md px-2.5 py-1.5"
            >
              <Crosshair size={13} /> Показать на карте
            </button>
          </div>
        </div>

        <div className="p-4">
          <Section title="Идентификация">
            <Row icon={Hash} label="Род войск / тип" value={u.branch} />
            <Row icon={Building2} label="Подчинённость" value={u.subordination} />
            <Row icon={Award} label="Почётные наименования" value={u.honors} />
          </Section>

          <Section title="Дислокация">
            <Row icon={MapPin} label="Регион, город" value={`${u.region}, ${u.city}`} />
            <Row icon={MapPin} label="Адрес" value={u.address} />
            <Row icon={Hash} label="Координаты" value={`${u.coords[0].toFixed(4)}, ${u.coords[1].toFixed(4)}`} />
          </Section>

          <Section title="Контакты части">
            <Row icon={User} label="Командир" value={u.commander} />
            <Row icon={User} label="Начальник штаба" value={u.chiefOfStaff} />
            <Row icon={Phone} label="Телефон дежурного" value={u.dutyPhone} />
          </Section>

          <Section title="Прокурорский надзор">
            <Row icon={Shield} label="Военная прокуратура" value={u.prosecutorOffice} />
            <Row icon={User} label="Военный прокурор" value={u.prosecutor} />
            <Row icon={MapPin} label="Адрес" value={u.prosecutorAddress} />
            <Row icon={Phone} label="Телефон" value={u.prosecutorPhone} />
            <Row icon={Mail} label="E-mail" value={u.prosecutorEmail} />
            <Row icon={Calendar} label="На надзоре с" value={u.supervisionSince} />
            <Row icon={Hash} label="№ надзорного производства" value={u.caseNumber} />
          </Section>

          <Section title="Статус">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${u.status === "active" ? "bg-emerald-400" : u.status === "reformed" ? "bg-amber-400" : "bg-rose-400"}`} />
              <span className="text-sm text-slate-200">
                {u.status === "active" ? "Действующая" : u.status === "reformed" ? "Переформирована" : "Расформирована"}
              </span>
            </div>
            {u.formed && <Row icon={Calendar} label="Дата формирования" value={u.formed} />}
          </Section>
        </div>
      </div>
    );
  }

  // District selected
  const d = DISTRICTS[districtFilter!];
  const unitsInDistrict = filteredUnits.filter((u) => u.district === d.code);
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 overflow-hidden">
      <div className="p-4 relative" style={{ background: `linear-gradient(135deg, ${d.color}40 0%, transparent 80%)` }}>
        <button
          onClick={() => setDistrictFilter(null)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: d.color, color: "#fff" }}>
            <Shield size={11} /> {d.short}
          </span>
        </div>
        <div className="mt-2 text-xl font-bold text-white leading-tight">{d.name}</div>
        <div className="text-sm text-slate-300 mt-0.5">Штаб: {d.hq}</div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => focus({ kind: "district", id: d.code })}
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/10 rounded-md px-2.5 py-1.5"
          >
            <Crosshair size={13} /> Сфокусировать
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-slate-900/60 px-2 py-1.5 border border-slate-700/50">
            <div className="text-[10px] uppercase text-slate-500">Гарнизонов</div>
            <div className="text-lg font-bold text-white">{d.garrisons?.length ?? 0}</div>
          </div>
          <div className="rounded-md bg-slate-900/60 px-2 py-1.5 border border-slate-700/50">
            <div className="text-[10px] uppercase text-slate-500">Поднадзорных частей</div>
            <div className="text-lg font-bold text-white">{unitsInDistrict.length}</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Section title="Зона ответственности">
          <div className="text-[13px] text-slate-300 leading-relaxed">{d.regions}</div>
          <Row icon={Hash} label="Площадь" value={d.area} />
        </Section>

        <Section title="Руководство">
          <Row icon={User} label="Командующий" value={d.commander} />
          <Row icon={User} label="Начальник штаба" value={d.chiefOfStaff} />
        </Section>

        <Section title="Прокурорский надзор">
          <Row icon={Shield} label="Военная прокуратура" value={d.prosecutorOffice} />
          <Row icon={User} label="Военный прокурор" value={d.prosecutor} />
          <Row icon={MapPin} label="Адрес" value={d.prosecutorAddress} />
          <Row icon={Phone} label="Телефон" value={d.prosecutorPhone} />
          <Row icon={Mail} label="E-mail" value={d.prosecutorEmail} />
        </Section>

        {d.garrisons && d.garrisons.length > 0 && (
          <Section title="Гарнизоны">
            <div className="flex flex-wrap gap-1.5">
              {d.garrisons.map((g) => (
                <span key={g} className="text-[11px] rounded-md bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-slate-300">
                  {g}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
