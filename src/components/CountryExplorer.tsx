import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, Globe, Sparkles } from "lucide-react";
import type { CountryData, CountryNeighbor } from "@/lib/countryApi";
import CountryInfoSkeleton from "./CountryInfoSkeleton";

function formatPop(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

interface Props {
  country: CountryData | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onNeighborClick: (name: string) => void;
}

export default function CountryExplorer({ country, loading, error, onClose, onNeighborClick }: Props) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative pointer-events-auto">
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-80"
          >
            <CountryInfoSkeleton />
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 text-center w-72"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium">Country not found</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            <button onClick={onClose} className="mt-4 text-xs text-primary hover:underline">Close</button>
          </motion.div>
        )}

        {country && !loading && !error && (
          <div className="relative">
            {/* Neighbor cards orbiting around */}
            <NeighborOrbit
              neighbors={country.neighbors}
              onSelect={onNeighborClick}
            />

            {/* Center card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-panel w-80 overflow-hidden relative z-10"
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 rounded-full p-1.5 bg-card/80 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Flag */}
              <div className="h-36 overflow-hidden">
                <img
                  src={country.flag_url}
                  alt={`Flag of ${country.name}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-5 space-y-4">
                <h3 className="text-xl font-bold tracking-tight">{country.name}</h3>

                <div className="space-y-2.5">
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Capital" value={country.capital} />
                  <InfoRow icon={<Users className="h-3.5 w-3.5" />} label="Population" value={formatPop(country.population)} />
                  <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Continent" value={country.continent} />
                  <InfoRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Famous for" value={country.famous_for} />
                </div>

                {country.neighbors.length > 0 && (
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center pt-1">
                    Click a neighbor to explore →
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fixed positions around the center card to avoid overlap
const POSITIONS: { x: number; y: number }[] = [
  { x: 0, y: -280 },     // top center
  { x: 250, y: -200 },   // top right
  { x: 300, y: 0 },      // right
  { x: 250, y: 200 },    // bottom right
  { x: 0, y: 280 },      // bottom center
  { x: -250, y: 200 },   // bottom left
  { x: -300, y: 0 },     // left
  { x: -250, y: -200 },  // top left
];

const POSITIONS_SM: { x: number; y: number }[] = [
  { x: 0, y: -220 },
  { x: 190, y: -150 },
  { x: 220, y: 0 },
  { x: 190, y: 150 },
  { x: 0, y: 220 },
  { x: -190, y: 150 },
  { x: -220, y: 0 },
  { x: -190, y: -150 },
];

function NeighborOrbit({ neighbors, onSelect }: { neighbors: CountryNeighbor[]; onSelect: (name: string) => void }) {
  const displayed = neighbors.slice(0, 8);
  const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
  const positions = isSmall ? POSITIONS_SM : POSITIONS;

  // Distribute neighbors evenly across available slots
  const slots = displayed.map((_, i) => {
    const slotIndex = displayed.length === 1 ? 0
      : Math.round((i / displayed.length) * positions.length) % positions.length;
    return positions[slotIndex];
  });

  return (
    <>
      {displayed.map((n, i) => {
        const pos = slots[i];
        return (
          <motion.button
            key={n.name}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.1 + i * 0.06,
            }}
            onClick={() => onSelect(n.name)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0
                       glass-panel flex items-center gap-2 px-3 py-2 cursor-pointer
                       hover:scale-110 hover:shadow-lg transition-all duration-200
                       hover:border-primary/50 group"
            style={{ willChange: "transform" }}
          >
            <img
              src={n.flag_url}
              alt=""
              className="h-6 w-8 rounded-sm object-cover border border-border/30 shrink-0"
            />
            <span className="text-xs font-medium whitespace-nowrap max-w-[90px] truncate group-hover:text-primary transition-colors">
              {n.name}
            </span>
          </motion.button>
        );
      })}

      {/* Connection lines */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] pointer-events-none"
        width="700"
        height="700"
        viewBox="-350 -350 700 700"
      >
        {displayed.map((n, i) => {
          const pos = slots[i];
          return (
            <motion.line
              key={n.name}
              x1={0}
              y1={0}
              x2={pos.x}
              y2={pos.y}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeOpacity={0.15}
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
            />
          );
        })}
      </svg>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}
