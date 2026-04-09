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

    // No tile layer for labels - we'll add capital markers manually

    mapRef.current = map;

    // Fetch world GeoJSON and official India GeoJSON in parallel
    const WORLD_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
    const INDIA_URL = "https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson";

    Promise.all([
      fetch(WORLD_URL).then((r) => r.json()),
      fetch(INDIA_URL).then((r) => r.json()).catch(() => null),
    ])
      .then(([worldData, indiaData]) => {
        // Replace India's geometry with the official one
        if (indiaData) {
          // Remove existing India feature(s) from world data
          worldData.features = worldData.features.filter((f: any) => {
            const name = (f.properties?.ADMIN || f.properties?.name || "").toLowerCase();
            return name !== "india";
          });

          // Merge all India geometries into one MultiPolygon (outer boundary only)
          const allCoords: any[] = [];
          for (const feature of indiaData.features) {
            if (feature.geometry.type === "Polygon") {
              // Only take the outer ring (index 0), skip holes to avoid internal borders
              allCoords.push([feature.geometry.coordinates[0]]);
            } else if (feature.geometry.type === "MultiPolygon") {
              for (const poly of feature.geometry.coordinates) {
                allCoords.push([poly[0]]);
              }
            }
          }

          worldData.features.push({
            type: "Feature",
            properties: { ADMIN: "India", name: "India" },
            geometry: { type: "MultiPolygon", coordinates: allCoords },
          });
        }

        L.geoJSON(worldData, {
          style: (feature) => {
            const name = feature?.properties?.ADMIN || feature?.properties?.name || "";
            const isIndia = name.toLowerCase() === "india";
            return {
              fillColor: isIndia ? "transparent" : PALETTE[hashCode(name) % PALETTE.length],
              weight: isIndia ? 2 : 1.2,
              color: isIndia ? "#1D4ED8" : "#FFFFFF",
              fillOpacity: isIndia ? 0 : 0.75,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties.ADMIN || feature.properties.name;
            const isIndia = (name || "").toLowerCase() === "india";
            const baseColor = isIndia ? "transparent" : PALETTE[hashCode(name || "") % PALETTE.length];
            const baseWeight = isIndia ? 2 : 1.2;
            const baseBorderColor = isIndia ? "#1D4ED8" : "#FFFFFF";
            const baseOpacity = isIndia ? 0 : 0.75;
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
                  path.setStyle({ fillColor: baseColor, weight: baseWeight, color: baseBorderColor, fillOpacity: baseOpacity });
                }
              },
              click: () => {
                if (activeLayerRef.current && activeLayerRef.current !== path) {
                  const prev = activeLayerRef.current as any;
                  const prevName = prev.feature?.properties?.ADMIN || prev.feature?.properties?.name || "";
                  const prevIsIndia = prevName.toLowerCase() === "india";
                  const prevColor = prevIsIndia ? "transparent" : PALETTE[hashCode(prevName) % PALETTE.length];
                  activeLayerRef.current.setStyle({ fillColor: prevColor, weight: prevIsIndia ? 2 : 1.2, color: prevIsIndia ? "#1D4ED8" : "#FFFFFF", fillOpacity: prevIsIndia ? 0 : 0.75 });
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
                  html: `<span style="font-size:10px;font-weight:600;color:#334155;text-shadow:0 0 3px #fff,0 0 3px #fff;white-space:nowrap;pointer-events:none">${capitalName}</span>`,
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
