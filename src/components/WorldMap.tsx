import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Layer, LeafletMouseEvent } from "leaflet";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const defaultStyle = {
  fillColor: "hsl(210, 15%, 93%)",
  weight: 1,
  color: "hsl(214, 20%, 82%)",
  fillOpacity: 0.6,
};

const hoverStyle = {
  fillColor: "hsl(210, 100%, 85%)",
  weight: 2,
  color: "hsl(210, 100%, 50%)",
  fillOpacity: 0.7,
};

export default function WorldMap({ onCountryClick, flyTo }: WorldMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const geoRef = useRef<any>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {
        // Fallback: simpler dataset
        fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
          .then((r) => r.json())
          .then(setGeoData);
      });
  }, []);

  const onEachFeature = (feature: any, layer: Layer) => {
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const l = e.target;
        l.setStyle(hoverStyle);
        l.bringToFront();
      },
      mouseout: (e: LeafletMouseEvent) => {
        const l = e.target;
        l.setStyle(defaultStyle);
      },
      click: () => {
        const name = feature.properties.ADMIN || feature.properties.name;
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
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      {geoData && (
        <GeoJSON
          ref={geoRef}
          data={geoData}
          style={defaultStyle}
          onEachFeature={onEachFeature}
        />
      )}
      <FlyToHandler flyTo={flyTo || null} />
    </MapContainer>
  );
}
