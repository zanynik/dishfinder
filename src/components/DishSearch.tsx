import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ResultsColumn from "./ResultsColumn";
import { sampleData } from "@/lib/sampleData";

const DishSearch = () => {
  const [dish, setDish] = useState("");
  const [results, setResults] = useState<null | {
    top: Array<{ dish: string; restaurant: string }>;
    bottom: Array<{ dish: string; restaurant: string }>;
  }>(null);

  const handleSearch = () => {
    // Simulate search with sample data
    const dishResults = sampleData.dishes[dish.toLowerCase()] || {
      top: [],
      bottom: [],
    };
    setResults(dishResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter dish name..."
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      
      {results && (
        <div className="grid grid-cols-2 gap-6">
          <ResultsColumn title="Top Rated" items={results.top} />
          <ResultsColumn title="Least Rated" items={results.bottom} />
        </div>
      )}
    </div>
  );
};

export default DishSearch;