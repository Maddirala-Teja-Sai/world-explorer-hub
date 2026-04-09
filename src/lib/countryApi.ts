export interface CountryNeighbor {
  name: string;
  flag_url: string;
}

export interface CountryData {
  name: string;
  capital: string;
  population: number;
  continent: string;
  famous_for: string;
  flag_url: string;
  neighbors: CountryNeighbor[];
}

const FAMOUS_FOR: Record<string, string> = {
  France: "Eiffel Tower, fine wine, and haute cuisine",
  Germany: "Engineering excellence, Oktoberfest, and castles",
  Italy: "Ancient Roman ruins, pizza, and Renaissance art",
  Spain: "Flamenco, tapas, and stunning beaches",
  "United States": "Silicon Valley, Hollywood, and national parks",
  Brazil: "Carnival, Amazon rainforest, and football",
  Japan: "Cherry blossoms, anime, and cutting-edge technology",
  India: "Taj Mahal, diverse cuisine, and Bollywood",
  China: "Great Wall, ancient history, and tea culture",
  Australia: "Great Barrier Reef, kangaroos, and the Outback",
  Canada: "Maple syrup, stunning nature, and hockey",
  Mexico: "Ancient pyramids, vibrant culture, and tacos",
  Egypt: "Pyramids of Giza, Sphinx, and the Nile River",
  "South Africa": "Safari wildlife, Table Mountain, and diverse culture",
  Russia: "Vast landscapes, ballet, and space exploration",
  "United Kingdom": "Royal heritage, Big Ben, and afternoon tea",
  Argentina: "Tango, steak, and Patagonia",
  Turkey: "Istanbul, rich history, and Turkish baths",
  Thailand: "Temples, street food, and tropical islands",
  "South Korea": "K-pop, technology, and kimchi",
};

// Map alpha3 codes to country names using restcountries
let alpha3Cache: Record<string, { name: string; flag: string }> | null = null;

async function getAlpha3Map(): Promise<Record<string, { name: string; flag: string }>> {
  if (alpha3Cache) return alpha3Cache;
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=cca3,name,flags");
    const data = await res.json();
    const map: Record<string, { name: string; flag: string }> = {};
    for (const c of data) {
      map[c.cca3] = { name: c.name.common, flag: c.flags?.png || "" };
    }
    alpha3Cache = map;
    return map;
  } catch {
    return {};
  }
}

export async function fetchCountry(name: string): Promise<CountryData> {
  const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
  if (!res.ok) {
    // Try partial match
    const res2 = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
    if (!res2.ok) throw new Error("Country not found");
    const data2 = await res2.json();
    return mapCountry(data2[0]);
  }
  const data = await res.json();
  return mapCountry(data[0]);
}

async function mapCountry(c: any): Promise<CountryData> {
  const borders: string[] = c.borders || [];
  const alpha3Map = await getAlpha3Map();
  
  const neighbors: CountryNeighbor[] = borders
    .map((code: string) => {
      const info = alpha3Map[code];
      return info ? { name: info.name, flag_url: info.flag } : null;
    })
    .filter(Boolean) as CountryNeighbor[];

  const commonName = c.name?.common || "Unknown";

  return {
    name: commonName,
    capital: c.capital?.[0] || "N/A",
    population: c.population || 0,
    continent: c.continents?.[0] || c.region || "Unknown",
    famous_for: FAMOUS_FOR[commonName] || `Beautiful country in ${c.region || "the world"}`,
    flag_url: c.flags?.svg || c.flags?.png || "",
    neighbors,
  };
}

export async function searchCountries(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: any) => c.name.common).slice(0, 8);
  } catch {
    return [];
  }
}
