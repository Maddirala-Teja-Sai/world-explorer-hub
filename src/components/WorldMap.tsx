import { useEffect, useRef } from "react";
import L from "leaflet";

const PALETTE = [
  "#93C5FD", "#86EFAC", "#FCA5A5", "#FCD34D", "#C4B5FD",
  "#67E8F9", "#FDBA74", "#F9A8D4", "#A5B4FC", "#BEF264",
  "#FDE68A", "#5EEAD4",
];

const HOVER_COLOR = "#60A5FA";
const ACTIVE_COLOR = "#3B82F6";

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface WorldMapProps {
  onCountryClick: (name: string) => void;
  flyTo?: { lat: number; lng: number } | null;
}

export default function WorldMap({ onCountryClick, flyTo }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const activeLayerRef = useRef<L.Path | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    map.getContainer().style.background = "#F0F4F8";
    mapRef.current = map;

    const WORLD_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

    fetch(WORLD_URL).then((r) => r.json())
      .then((worldData) => {
        L.geoJSON(worldData, {
          style: (feature) => {
            const name = feature?.properties?.ADMIN || feature?.properties?.name || "";
            return {
              fillColor: PALETTE[hashCode(name) % PALETTE.length],
              weight: 1.2,
              color: "#FFFFFF",
              fillOpacity: 0.75,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties.ADMIN || feature.properties.name;
            const baseColor = PALETTE[hashCode(name || "") % PALETTE.length];
            const path = layer as L.Path;

            layer.on({
              mouseover: () => {
                if (activeLayerRef.current !== path) {
                  path.setStyle({ fillColor: HOVER_COLOR, weight: 2, color: "#3B82F6", fillOpacity: 0.85 });
                  path.bringToFront();
                }
              },
              mouseout: () => {
                if (activeLayerRef.current !== path) {
                  path.setStyle({ fillColor: baseColor, weight: 1.2, color: "#FFFFFF", fillOpacity: 0.75 });
                }
              },
              click: () => {
                if (activeLayerRef.current && activeLayerRef.current !== path) {
                  const prev = activeLayerRef.current as any;
                  const prevName = prev.feature?.properties?.ADMIN || prev.feature?.properties?.name || "";
                  const prevColor = PALETTE[hashCode(prevName) % PALETTE.length];
                  activeLayerRef.current.setStyle({ fillColor: prevColor, weight: 1.2, color: "#FFFFFF", fillOpacity: 0.75 });
                }
                activeLayerRef.current = path;
                path.setStyle({ fillColor: ACTIVE_COLOR, weight: 2.5, color: "#1D4ED8", fillOpacity: 0.9 });
                if (name) onCountryClick(name);
              },
            });
          },
        }).addTo(map);

        // Add capital city labels
        fetch("https://restcountries.com/v3.1/all?fields=name,capital,capitalInfo")
          .then((r) => r.json())
          .then((countries: any[]) => {
            for (const c of countries) {
              const latlng = c.capitalInfo?.latlng;
              const capitalName = c.capital?.[0];
              if (!latlng || !capitalName) continue;
              L.marker([latlng[0], latlng[1]], {
                icon: L.divIcon({
                  className: "capital-label",
                  html: `<span style="font-size:11px;font-weight:700;color:#1e293b;text-shadow:0 0 4px #fff,0 0 4px #fff,0 0 2px #fff;white-space:nowrap;pointer-events:none">★ ${capitalName}</span>`,
                  iconSize: [0, 0],
                  iconAnchor: [0, 0],
                }),
                interactive: false,
              }).addTo(map);
            }
          })
          .catch(() => {});
      })
      .catch(console.error);

    return () => { map.remove(); mapRef.current = null; };
  }, [onCountryClick]);

  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo([flyTo.lat, flyTo.lng], 5, { duration: 1.5 });
    }
  }, [flyTo]);

  return <div ref={containerRef} className="h-full w-full" />;
}
