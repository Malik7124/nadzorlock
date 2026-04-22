import fs from "fs";
import * as turf from "@turf/turf";
import polygonClipping from "polygon-clipping";

const src = JSON.parse(fs.readFileSync("./regions.geojson", "utf8"));

const mapping = {
  LVO: [
    "санкт-петербург", "ленинградская", "карелия", "мурманская", "архангельская",
    "ненецкий", "коми", "вологодская", "новгородская", "псковская", "калининградская",
  ],
  MVO: [
    "москва", "московская", "тверская", "смоленская", "калужская", "тульская",
    "брянская", "орловская", "курская", "белгородская", "липецкая", "воронежская",
    "тамбовская", "рязанская", "владимирская", "ивановская", "ярославская",
    "костромская", "нижегородская", "мордовия", "марий эл", "чувашия",
  ],
  YVO: [
    "ростовская", "краснодарский", "адыгея", "ставропольский", "калмыкия",
    "астраханская", "волгоградская", "карачаево", "кабардино", "северная осетия",
    "ингушетия", "чеченская", "дагестан",
  ],
  CVO: [
    "татарстан", "башкортостан", "удмуртская", "пермский", "кировская",
    "оренбургская", "саратовская", "самарская", "ульяновская", "пензенская",
    "свердловская", "челябинская", "курганская", "тюменская", "ханты-мансийский",
    "ямало-ненецкий", "омская", "новосибирская", "томская", "кемеровская",
    "алтайский", "алтай", "хакасия", "тыва", "красноярский",
  ],
  VVO: [
    "иркутская", "бурятия", "забайкальский", "саха", "якутия", "амурская",
    "еврейская", "хабаровский", "приморский", "сахалинская", "камчатский",
    "магаданская", "чукотский",
  ],
};

// Реальные контуры новых регионов РФ загружены из открытого источника
// (github.com/EugeneBorshch/ukraine_geojson, ODbL) и включены в состав ЮВО.
const extraYVOFiles = [
  "./ua_regions/UA_09_Luhanska.geojson",
  "./ua_regions/UA_14_Donetska.geojson",
  "./ua_regions/UA_23_Zaporizka.geojson",
  "./ua_regions/UA_65_Khersonska.geojson",
  "./ua_regions/UA_43_Krym.geojson",
];
// Нормализация: часть файлов в источнике содержит несколько независимых
// кусков суши как «кольца» внутри одного Polygon (а должно быть MultiPolygon).
// Разворачиваем каждое кольцо в самостоятельный полигон.
function normalizeFeat(feat) {
  const g = feat.geometry;
  if (g.type === "Polygon" && g.coordinates.length > 1) {
    return {
      ...feat,
      geometry: {
        type: "MultiPolygon",
        coordinates: g.coordinates.map((ring) => [ring]),
      },
    };
  }
  return feat;
}

const extraYVO = extraYVOFiles.map((p) => {
  const feat = normalizeFeat(JSON.parse(fs.readFileSync(p, "utf8")));
  try {
    const clipped = turf.bboxClip(feat, [-179.9, 40, 179.9, 82]);
    const buffered = turf.buffer(clipped, 3, { units: "kilometers" }) || clipped;
    return buffered;
  } catch {
    return feat;
  }
});

// (старые хардкоженные полигоны больше не используются)
const _unused_extraYVO = [
  {
    name: "Крым",
    coords: [[
      // Тарханкут (северо-запад)
      [32.50, 45.35], [32.60, 45.45], [32.88, 45.52], [33.10, 45.60],
      [33.35, 45.75], [33.55, 45.90], [33.65, 46.00],
      // Перекопский перешеек
      [33.70, 46.17], [34.00, 46.15],
      // Сиваш (внутренний залив, восточный берег Крыма)
      [34.30, 46.05], [34.55, 45.95], [34.80, 45.85],
      [35.10, 45.90], [35.30, 45.95], [35.55, 46.00],
      // Арабатская стрелка — северо-восточный угол
      [35.55, 46.08],
      // Казантипский/Керченский полуостров
      [36.00, 45.48], [36.30, 45.45], [36.50, 45.42],
      [36.60, 45.35], [36.62, 45.25], [36.50, 45.05],
      [36.25, 45.02], [35.90, 44.95], [35.55, 44.95],
      // Южный берег
      [35.40, 44.85], [35.15, 44.80], [34.95, 44.78],
      [34.75, 44.77], [34.55, 44.72], [34.35, 44.65],
      [34.15, 44.55], [33.95, 44.48], [33.78, 44.42],
      [33.60, 44.40], [33.45, 44.45], [33.35, 44.55],
      // Севастополь / Херсонес
      [33.38, 44.60], [33.55, 44.65], [33.50, 44.80],
      [33.40, 44.95], [33.25, 45.05], [33.00, 45.15],
      [32.80, 45.20], [32.65, 45.28], [32.50, 45.35]
    ]],
  },
  {
    name: "Херсонская",
    coords: [[
      // Северное побережье (граница с Николаевской / Днепропетровской)
      [32.20, 46.95], [32.55, 47.05], [32.95, 47.15],
      [33.40, 47.20], [33.85, 47.22], [34.30, 47.20],
      [34.65, 47.15], [34.95, 47.05],
      // Восток — переход к Запорожской
      [35.10, 46.90], [35.20, 46.75], [35.25, 46.60],
      // Сиваш / южная граница с Крымом (через Перекоп)
      [35.05, 46.30], [34.80, 46.25], [34.55, 46.25],
      [34.20, 46.20], [33.95, 46.20], [33.70, 46.20],
      // Низовье Днепра и лиман
      [33.40, 46.35], [33.05, 46.45], [32.75, 46.55],
      [32.45, 46.60], [32.20, 46.65],
      [32.10, 46.75], [32.15, 46.85], [32.20, 46.95]
    ]],
  },
  {
    name: "Запорожская",
    coords: [[
      // Северо-запад (Днепр, Каменка-Днепровская)
      [34.90, 47.75], [35.15, 47.95], [35.40, 48.10],
      [35.70, 48.20], [36.00, 48.22], [36.25, 48.18],
      // Север-восток (граница с Донецкой)
      [36.55, 48.05], [36.80, 47.85], [36.95, 47.65],
      [37.10, 47.45], [37.15, 47.25],
      // Побережье Азовского моря
      [37.00, 47.05], [36.70, 46.95], [36.35, 46.85],
      [36.00, 46.80], [35.65, 46.75], [35.30, 46.70],
      // Запад — стык с Херсонской
      [35.10, 46.80], [34.95, 47.05], [34.85, 47.30],
      [34.85, 47.50], [34.90, 47.75]
    ]],
  },
  {
    name: "Донецкая",
    coords: [[
      // Азовское побережье от Бердянска до Мариуполя и далее
      [36.95, 47.00], [37.25, 46.95], [37.55, 46.90],
      [37.85, 46.92], [38.10, 46.98],
      // Восточная граница (к морю Азовскому / Таганрогскому заливу)
      [38.30, 47.15], [38.45, 47.40], [38.55, 47.65],
      [38.70, 47.90], [38.80, 48.15],
      // Север (Славянск, Краматорск, Святогорск)
      [38.75, 48.40], [38.60, 48.65], [38.35, 48.85],
      [38.05, 48.95], [37.75, 48.95], [37.45, 48.85],
      // Северо-запад
      [37.20, 48.65], [37.00, 48.40], [36.85, 48.15],
      // Запад (граница с Запорожской)
      [36.80, 47.85], [36.85, 47.55], [36.90, 47.25],
      [36.95, 47.00]
    ]],
  },
  {
    name: "Луганская",
    coords: [[
      // Юго-запад (стык с Донецкой)
      [38.10, 48.10], [38.35, 48.20], [38.55, 48.35],
      [38.75, 48.55], [38.85, 48.70],
      // Юг (граница с Ростовской областью РФ)
      [39.05, 48.55], [39.30, 48.45], [39.55, 48.40],
      [39.80, 48.45], [40.00, 48.55],
      // Восток (граница с Воронежской)
      [40.15, 48.75], [40.20, 49.00], [40.15, 49.25],
      [40.05, 49.50], [39.85, 49.65],
      // Север (Старобельск, Сватово)
      [39.55, 49.75], [39.20, 49.80], [38.85, 49.75],
      [38.55, 49.60], [38.30, 49.35],
      // Запад
      [38.15, 49.05], [38.05, 48.75], [38.05, 48.45],
      [38.10, 48.10]
    ]],
  },
];

// Convert GeoJSON feature geometry to polygon-clipping format: Array of polygons,
// each polygon is array of rings, each ring is array of [x,y].
function toPC(geom) {
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  return [];
}

function bufferRing(ring, delta) {
  // trivial outward expansion around centroid; good enough to close micro-gaps
  let cx = 0, cy = 0;
  for (const [x, y] of ring) { cx += x; cy += y; }
  cx /= ring.length; cy /= ring.length;
  return ring.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    return [x + (dx / d) * delta, y + (dy / d) * delta];
  });
}

function bufferFeature(feat, deltaDeg) {
  // Use turf.buffer per-feature (km); here accept a small km buffer
  try {
    const b = turf.buffer(feat, deltaDeg, { units: "kilometers" });
    return b || feat;
  } catch {
    return feat;
  }
}

// Назначаем каждому региону ровно ОДИН округ — тот, чей ключ совпал
// максимально точно (по длине). Это убирает двойные наложения полигонов
// (например, Ямало-Ненецкий АО совпадает и с «ненецкий» ЛВО, и с
// «ямало-ненецкий» ЦВО — побеждает более длинный ключ).
const assignment = new Map(); // featureIndex -> districtCode
for (let i = 0; i < src.features.length; i++) {
  const name = src.features[i].properties.name.toLowerCase();
  let best = { code: null, len: -1 };
  for (const [code, keys] of Object.entries(mapping)) {
    for (const k of keys) {
      if (name.includes(k) && k.length > best.len) {
        best = { code, len: k.length };
      }
    }
  }
  if (best.code) assignment.set(i, best.code);
}

const findFeatures = (code) =>
  src.features.filter((_f, i) => assignment.get(i) === code);

const districts = {};
for (const [code] of Object.entries(mapping)) {
  const feats = findFeatures(code);
  console.log(`${code}: ${feats.length} regions matched`);

  // clip each feature to avoid antimeridian crossing (Chukotka tips)
  const clipped = feats.map((f) => {
    try {
      return turf.bboxClip(f, [-179.9, 40, 179.9, 82]);
    } catch {
      return f;
    }
  });
  // buffer each by ~3 km to close micro-gaps between neighbors
  const buffered = clipped.map((f) => bufferFeature(f, 3));

  // accumulate via polygon-clipping.union
  const polys = buffered.map((f) => toPC(f.geometry));
  const unioned = polygonClipping.union(...polys);

  districts[code] = {
    type: "Feature",
    properties: { code },
    geometry: unioned.length === 1
      ? { type: "Polygon", coordinates: unioned[0] }
      : { type: "MultiPolygon", coordinates: unioned },
  };
}

// Add extras to YVO (реальные GeoJSON-фичи из загруженных файлов)
if (extraYVO.length) {
  const basePolys = toPC(districts.YVO.geometry);
  const extras = extraYVO.map((f) => toPC(f.geometry));
  const combined = polygonClipping.union(basePolys, ...extras);
  districts.YVO.geometry = combined.length === 1
    ? { type: "Polygon", coordinates: combined[0] }
    : { type: "MultiPolygon", coordinates: combined };
}

const meta = {
  LVO: { code: "LVO", name: "Ленинградский военный округ", short: "ЛВО", color: "#4a90d9", hq: "Санкт-Петербург" },
  MVO: { code: "MVO", name: "Московский военный округ", short: "МВО", color: "#9b7bc4", hq: "Москва" },
  YVO: { code: "YVO", name: "Южный военный округ", short: "ЮВО", color: "#c14b3a", hq: "Ростов-на-Дону" },
  CVO: { code: "CVO", name: "Центральный военный округ", short: "ЦВО", color: "#4d9e73", hq: "Екатеринбург" },
  VVO: { code: "VVO", name: "Восточный военный округ", short: "ВВО", color: "#c9a961", hq: "Хабаровск" },
};

const out = {
  type: "FeatureCollection",
  features: Object.entries(districts).map(([code, feat]) => {
    let f = { type: "Feature", properties: meta[code], geometry: feat.geometry };
    try { f = turf.cleanCoords(f); } catch {}
    try { f = turf.simplify(f, { tolerance: 0.015, highQuality: false }); } catch {}
    return f;
  })
};

fs.writeFileSync("./src/data/districts.geojson.json", JSON.stringify(out));
console.log("Wrote districts.geojson.json", (JSON.stringify(out).length / 1024).toFixed(1), "KB");
