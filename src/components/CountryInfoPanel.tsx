import { X, MapPin, Users, Globe, Sparkles } from "lucide-react";
import type { CountryData } from "@/lib/countryApi";
import NeighborList from "./NeighborList";
import CountryInfoSkeleton from "./CountryInfoSkeleton";

interface CountryInfoPanelProps {
  country: CountryData | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onNeighborClick: (name: string) => void;
}

function formatPop(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function CountryInfoPanel({ country, loading, error, onClose, onNeighborClick }: CountryInfoPanelProps) {
  return (
    <div className="glass-panel w-full max-w-sm overflow-hidden animate-slide-in flex flex-col max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Country Details</h2>
        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {loading && <CountryInfoSkeleton />}

        {error && (
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">Country not found</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
        )}

        {country && !loading && !error && (
          <div className="space-y-5 p-6 animate-fade-up">
            {/* Flag */}
            <div className="overflow-hidden rounded-xl border border-border/50">
              <img
                src={country.flag_url}
                alt={`Flag of ${country.name}`}
                className="h-36 w-full object-cover"
              />
            </div>

            {/* Name */}
            <h3 className="text-2xl font-bold tracking-tight">{country.name}</h3>

            {/* Info grid */}
            <div className="space-y-3">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Capital" value={country.capital} />
              <InfoRow icon={<Users className="h-4 w-4" />} label="Population" value={formatPop(country.population)} />
              <InfoRow icon={<Globe className="h-4 w-4" />} label="Continent" value={country.continent} />
              <InfoRow icon={<Sparkles className="h-4 w-4" />} label="Famous for" value={country.famous_for} />
            </div>

            {/* Neighbors */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Neighboring Countries
              </p>
              <NeighborList neighbors={country.neighbors} onSelect={onNeighborClick} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
