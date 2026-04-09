import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { fetchCountry, type CountryData } from "@/lib/countryApi";
import WorldMap from "@/components/WorldMap";
import SearchBar from "@/components/SearchBar";
import CountryExplorer from "@/components/CountryExplorer";

export default function Index() {
  const [country, setCountry] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

  const loadCountry = useCallback(async (name: string) => {
    setPanelOpen(true);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCountry(name);
      setCountry(data);
    } catch (e: any) {
      setError(e.message || "Failed to load country data");
      setCountry(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (name: string) => {
    loadCountry(name);
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=latlng`);
      if (res.ok) {
        const data = await res.json();
        if (data[0]?.latlng) setFlyTo({ lat: data[0].latlng[0], lng: data[0].latlng[1] });
      }
    } catch {}
  }, [loadCountry]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <WorldMap onCountryClick={loadCountry} flyTo={flyTo} />

      {/* Search */}
      <div className="absolute top-4 left-4 z-[1000]">
        <SearchBar onSelect={handleSearch} />
      </div>

      {/* Logo */}
      <div className="absolute top-4 right-4 z-[1000] glass-panel px-4 py-2">
        <span className="text-sm font-bold tracking-tight">🌍 World Explorer</span>
      </div>

      {/* Country explorer overlay */}
      <AnimatePresence>
        {panelOpen && (
          <CountryExplorer
            country={country}
            loading={loading}
            error={error}
            onClose={() => setPanelOpen(false)}
            onNeighborClick={loadCountry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
