import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ResultsColumn from "./ResultsColumn";
import { sampleData } from "@/lib/sampleData";

const CitySearch = () => {
  const [city, setCity] = useState("");
  const [results, setResults] = useState<null | {
    appetizers: Array<{ dish: string; restaurant: string }>;
    mains: Array<{ dish: string; restaurant: string }>;
    desserts: Array<{ dish: string; restaurant: string }>;
  }>(null);

  const handleSearch = () => {
    // Simulate search with sample data
    const cityResults = sampleData.cities[city.toLowerCase()] || {
      appetizers: [],
      mains: [],
      desserts: [],
    };
    setResults(cityResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      
      {results && (
        <div className="grid grid-cols-3 gap-6">
          <ResultsColumn title="Appetizers" items={results.appetizers} />
          <ResultsColumn title="Main Course" items={results.mains} />
          <ResultsColumn title="Desserts" items={results.desserts} />
        </div>
      )}
    </div>
  );
};

export default CitySearch;