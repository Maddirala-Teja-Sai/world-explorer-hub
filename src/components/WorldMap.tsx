import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Layer, LeafletMouseEvent } from "leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Vibrant palette for countries
const PALETTE = [
  "hsl(210, 70%, 82%)",  // soft blue
  "hsl(160, 55%, 78%)",  // mint
  "hsl(340, 60%, 85%)",  // blush pink
  "hsl(45, 70%, 80%)",   // warm sand
  "hsl(270, 45%, 83%)",  // lavender
  "hsl(120, 40%, 80%)",  // sage green
  "hsl(30, 65%, 80%)",   // peach
  "hsl(195, 60%, 80%)",  // sky
  "hsl(0, 55%, 83%)",    // rose
  "hsl(80, 45%, 78%)",   // lime
  "hsl(220, 50%, 85%)",  // periwinkle
  "hsl(15, 60%, 82%)",   // coral
];

const HOVER_COLOR = "hsl(210, 100%, 70%)";
const ACTIVE_COLOR = "hsl(210, 100%, 60%)";

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface WorldMapProps {
  onCountryClick: (name: string) => void;
  flyTo?: { lat: number; lng: number } | null;
}

function FlyToHandler({ flyTo }: { flyTo: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 5, { duration: 1.5 });
    }
  }, [flyTo, map]);
  return null;
}

export default function WorldMap({ onCountryClick, flyTo }: WorldMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const activeLayerRef = useRef<any>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {
        fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
          .then((r) => r.json())
          .then(setGeoData);
      });
  }, []);

  const style = useMemo(() => {
    return (feature: any) => {
      const name = feature?.properties?.ADMIN || feature?.properties?.name || "";
      const color = PALETTE[hashCode(name) % PALETTE.length];
      return {
        fillColor: color,
        weight: 1.2,
        color: "hsl(0, 0%, 100%)",
        fillOpacity: 0.75,
      };
    };
  }, []);

  const onEachFeature = (feature: any, layer: Layer) => {
    const name = feature.properties.ADMIN || feature.properties.name;
    const baseColor = PALETTE[hashCode(name || "") % PALETTE.length];

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const l = e.target;
        l.setStyle({
          fillColor: HOVER_COLOR,
          weight: 2,
          color: "hsl(210, 100%, 50%)",
          fillOpacity: 0.85,
        });
        l.bringToFront();
      },
      mouseout: (e: LeafletMouseEvent) => {
        const l = e.target;
        if (activeLayerRef.current !== l) {
          l.setStyle({
            fillColor: baseColor,
            weight: 1.2,
            color: "hsl(0, 0%, 100%)",
            fillOpacity: 0.75,
          });
        }
      },
      click: () => {
        // Reset previous active
        if (activeLayerRef.current && activeLayerRef.current !== layer) {
          const prevName = activeLayerRef.current.feature?.properties?.ADMIN || activeLayerRef.current.feature?.properties?.name || "";
          const prevColor = PALETTE[hashCode(prevName) % PALETTE.length];
          activeLayerRef.current.setStyle({
            fillColor: prevColor,
            weight: 1.2,
            color: "hsl(0, 0%, 100%)",
            fillOpacity: 0.75,
          });
        }
        activeLayerRef.current = layer;
        (layer as any).setStyle({
          fillColor: ACTIVE_COLOR,
          weight: 2.5,
          color: "hsl(210, 100%, 40%)",
          fillOpacity: 0.9,
        });
        if (name) onCountryClick(name);
      },
    });
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2.5}
      minZoom={2}
      maxZoom={8}
      className="h-full w-full"
      style={{ background: "hsl(210, 30%, 96%)" }}
      zoomControl={false}
      attributionControl={false}
      worldCopyJump
    >
      {/* Labels only - no base map tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        attribution=""
        pane="markerPane"
      />
      {geoData && (
        <GeoJSON
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
      )}
      <FlyToHandler flyTo={flyTo || null} />
    </MapContainer>
  );
}
