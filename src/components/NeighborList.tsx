import type { CountryNeighbor } from "@/lib/countryApi";

interface NeighborListProps {
  neighbors: CountryNeighbor[];
  onSelect: (name: string) => void;
}

export default function NeighborList({ neighbors, onSelect }: NeighborListProps) {
  if (!neighbors.length) {
    return <p className="text-sm text-muted-foreground">No neighboring countries (island nation)</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {neighbors.map((n) => (
        <button
          key={n.name}
          onClick={() => onSelect(n.name)}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
        >
          <img src={n.flag_url} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
          {n.name}
        </button>
      ))}
    </div>
  );
}
