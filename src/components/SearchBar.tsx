import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchCountries } from "@/lib/countryApi";

interface SearchBarProps {
  onSelect: (name: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      searchCountries(query).then((r) => { setResults(r); setOpen(true); });
    }, 300);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (name: string) => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onSelect(name);
  };

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <div className="glass-panel flex items-center gap-2 px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 glass-panel overflow-hidden z-50">
          {results.map((name) => (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
