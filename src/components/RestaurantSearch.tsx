import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ResultsColumn from "./ResultsColumn";
import { sampleData } from "@/lib/sampleData";

const RestaurantSearch = () => {
  const [search, setSearch] = useState({ city: "", restaurant: "" });
  const [results, setResults] = useState<null | {
    appetizers: Array<{ dish: string; restaurant: string }>;
    mains: Array<{ dish: string; restaurant: string }>;
    desserts: Array<{ dish: string; restaurant: string }>;
  }>(null);

  const handleSearch = () => {
    // Simulate search with sample data
    const restaurantResults = sampleData.restaurants[search.restaurant.toLowerCase()] || {
      appetizers: [],
      mains: [],
      desserts: [],
    };
    setResults(restaurantResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter city..."
          value={search.city}
          onChange={(e) => setSearch({ ...search, city: e.target.value })}
          className="flex-1"
        />
        <Input
          placeholder="Enter restaurant name..."
          value={search.restaurant}
          onChange={(e) => setSearch({ ...search, restaurant: e.target.value })}
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

export default RestaurantSearch;