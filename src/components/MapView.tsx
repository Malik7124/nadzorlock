import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import * as turf from "@turf/turf";
import { DISTRICTS, districtsGeoJSON } from "../data/districts";
import { UNITS } from "../data/units";
import { useApp } from "../state";
import type { DistrictCode } from "../types";

function makeMarkerIcon(color: string, label: string, active: boolean, showLabel: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="unit-marker-wrap">
      <div class="unit-marker${active ? " active" : ""}" style="background:${color}"></div>
      ${showLabel ? `<div class="unit-marker-label">${label}</div>` : ""}
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Кэшируем bounds полигонов один раз — пересчёт через L.geoJSON()
// на каждый клик заметно лагает.
const districtBoundsCache: Record<string, L.LatLngBounds> = {};
function getDistrictBounds(code: string): L.LatLngBounds | null {
  if (districtBoundsCache[code]) return districtBoundsCache[code];
  const feat = districtsGeoJSON.features.find(
    (f: any) => f.properties.code === code
  );
  if (!feat) return null;
  const b = L.geoJSON(feat as any).getBounds();
  districtBoundsCache[code] = b;
  return b;
}

function FocusController() {
  const map = useMap();
  const { focusTarget } = useApp();

  useEffect(() => {
    if (!focusTarget) return;
    // Останавливаем текущую анимацию, чтобы новая не «дёргала» карту.
    map.stop();
    const opts = { duration: 0.7, easeLinearity: 0.25 };
    if (focusTarget.kind === "all") {
      map.flyTo([62, 95], 3.2, opts);
      return;
    }
    if (focusTarget.kind === "district" && focusTarget.id) {
      const b = getDistrictBounds(focusTarget.id);
      if (b) {
        map.flyToBounds(b, { padding: [40, 40], maxZoom: 6, ...opts });
      }
      return;
    }
    if (focusTarget.kind === "unit" && focusTarget.id) {
      const u = UNITS.find((x) => x.id === focusTarget.id);
      if (u) map.flyTo(u.coords, 9, opts);
    }
  }, [focusTarget, map]);

  return null;
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvent("zoomend", (e) => onZoom(e.target.getZoom()));
  return null;
}

function DistrictLabels() {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const group = layerRef.current;
    group.clearLayers();

    districtsGeoJSON.features.forEach((f: any) => {
      try {
        // Для MultiPolygon берём центр САМОГО КРУПНОГО куска,
        // а не общий centerOfMass (иначе лейбл ЛВО улетает в Финляндию из-за Калининграда).
        let target: any = f;
        if (f.geometry?.type === "MultiPolygon") {
          const polys = f.geometry.coordinates.map((coords: any) => ({
            type: "Feature" as const,
            properties: {},
            geometry: { type: "Polygon" as const, coordinates: coords },
          }));
          polys.sort((a: any, b: any) => turf.area(b) - turf.area(a));
          target = polys[0];
        }
        // pointOnFeature гарантированно возвращает точку ВНУТРИ полигона,
        // в отличие от centerOfMass у вогнутых фигур.
        const center = turf.pointOnFeature(target);
        const [lng, lat] = center.geometry.coordinates;
        L.marker([lat, lng], {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: "",
            html: `<div class="district-label">${f.properties.short}</div>`,
            iconSize: [0, 0],
          }),
        }).addTo(group);
      } catch {}
    });

    return () => { group.clearLayers(); };
  }, [map]);

  return null;
}

/** Cluster layer managed imperatively via leaflet.markercluster. */
function MarkerClusterLayer({
  zoom,
}: {
  zoom: number;
}) {
  const map = useMap();
  const { filteredUnits, selectedUnitId, setSelectedUnitId, focus } = useApp();
  const clusterRef = useRef<any>(null);

  useEffect(() => {
    const cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 45,
      disableClusteringAtZoom: 7,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        const big = count >= 10;
        return L.divIcon({
          className: "",
          html: `<div class="cluster-marker${big ? " big" : ""}">${count}</div>`,
          iconSize: big ? [42, 42] : [36, 36],
          iconAnchor: big ? [21, 21] : [18, 18],
        });
      },
    });
    cluster.addTo(map);
    clusterRef.current = cluster;
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    const visibleIds = new Set(filteredUnits.map((u) => u.id));
    UNITS.forEach((u) => {
      if (!visibleIds.has(u.id)) return;
      const active = selectedUnitId === u.id;
      const showLabel = zoom >= 5 || active;
      const marker = L.marker(u.coords, {
        icon: makeMarkerIcon(DISTRICTS[u.district].color, u.city, active, showLabel),
        zIndexOffset: active ? 1000 : 0,
      });
      marker.bindPopup(
        `<div><div class="mono" style="font-weight:700;color:#fff;font-size:13px">в/ч ${u.number}</div>
         <div style="opacity:0.85;margin-top:2px">${u.fullName}</div>
         <div style="opacity:0.65;font-size:11px;margin-top:4px">${u.city} · ${u.garrison} гарнизон</div></div>`
      );
      marker.on("click", () => {
        setSelectedUnitId(u.id);
        focus({ kind: "unit", id: u.id });
      });
      cluster.addLayer(marker);
    });
  }, [filteredUnits, selectedUnitId, zoom, setSelectedUnitId, focus]);

  return null;
}

export function MapView() {
  const { setSelectedUnitId, focus, districtFilter, setDistrictFilter, pushToast } = useApp();
  const [zoom, setZoom] = useState(3.2);
  const geoRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.eachLayer((layer: any) => {
      const code = layer.feature?.properties?.code as DistrictCode;
      const base = DISTRICTS[code]?.color ?? "#64748b";
      const isActive = districtFilter === code;
      layer.setStyle({
        color: base,
        weight: isActive ? 2 : 1,
        opacity: isActive ? 1 : 0.7,
        fillColor: base,
        fillOpacity: isActive ? 0.22 : 0.09,
      });
    });
  }, [districtFilter]);

  // Bounds расширены за реальные границы РФ с запасом, чтобы во время
  // flyTo / flyToBounds карта не «отбрасывалась» обратно к центру.
  const russiaBounds = L.latLngBounds([[20, 0], [85, 200]]);

  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={[62, 95]}
        zoom={3.2}
        minZoom={3}
        maxZoom={11}
        zoomControl={true}
        attributionControl={false}
        worldCopyJump={false}
        maxBounds={russiaBounds}
        maxBoundsViscosity={0.3}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />

        <GeoJSON
          data={districtsGeoJSON as any}
          ref={(r) => { geoRef.current = r; }}
          style={(feat: any) => {
            const code = feat.properties.code as DistrictCode;
            const color = DISTRICTS[code].color;
            return { color, weight: 1, fillColor: color, fillOpacity: 0.09, opacity: 0.7 };
          }}
          onEachFeature={(feat: any, layer: any) => {
            const code = feat.properties.code as DistrictCode;
            const d = DISTRICTS[code];
            layer.bindTooltip(
              `<div style="font-weight:600;color:${d.color}">${d.short}</div>
               <div style="opacity:0.8">${d.name}</div>
               <div style="opacity:0.6;font-size:10px;margin-top:2px">Штаб: ${d.hq}</div>`,
              { sticky: true }
            );
            layer.on("click", () => {
              setDistrictFilter(code);
              setSelectedUnitId(null);
              focus({ kind: "district", id: code });
              pushToast("info", `Выбран округ: ${d.short}`);
            });
            layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.2 }));
            layer.on("mouseout", () => {
              const active = districtFilter === code;
              layer.setStyle({ fillOpacity: active ? 0.22 : 0.09 });
            });
          }}
        />

        <DistrictLabels />
        <ZoomWatcher onZoom={setZoom} />
        <MarkerClusterLayer zoom={zoom} />

        <FocusController />
      </MapContainer>
    </div>
  );
}
