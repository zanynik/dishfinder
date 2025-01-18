import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ResultsColumn from "./ResultsColumn";
import { sampleData } from "@/lib/sampleData";

const UnifiedSearch = () => {
  const [search, setSearch] = useState({
    dish: "",
    city: "",
    restaurant: "",
  });

  const [results, setResults] = useState<{
    type: "city" | "restaurant" | "dish" | null;
    data: any;
  }>({ type: null, data: null });

  const handleSearch = () => {
    const { dish, city, restaurant } = search;

    // Restaurant search requires city
    if (restaurant && !city) {
      toast({
        title: "City Required",
        description: "Please enter a city name when searching for a restaurant.",
        variant: "destructive",
      });
      return;
    }

    // Determine search type and fetch results
    if (restaurant && city) {
      const restaurantResults = sampleData.restaurants[restaurant.toLowerCase()] || {
        appetizers: [],
        mains: [],
        desserts: [],
      };
      setResults({ type: "restaurant", data: restaurantResults });
    } else if (dish) {
      const dishResults = sampleData.dishes[dish.toLowerCase()] || {
        top: [],
        bottom: [],
      };
      setResults({ type: "dish", data: dishResults });
    } else if (city) {
      const cityResults = sampleData.cities[city.toLowerCase()] || {
        appetizers: [],
        mains: [],
        desserts: [],
      };
      setResults({ type: "city", data: cityResults });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Enter dish name..."
          value={search.dish}
          onChange={(e) => setSearch({ ...search, dish: e.target.value })}
          className="flex-1"
        />
        <Input
          placeholder="Enter city name..."
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
        <Button onClick={handleSearch} className="md:w-24">Search</Button>
      </div>

      {results.type && (
        <div className={`grid ${results.type === 'dish' ? 'grid-cols-2' : 'grid-cols-3'} gap-6`}>
          {results.type === 'dish' ? (
            <>
              <ResultsColumn title="Top Rated" items={results.data.top} />
              <ResultsColumn title="Least Rated" items={results.data.bottom} />
            </>
          ) : (
            <>
              <ResultsColumn title="Appetizers" items={results.data.appetizers} />
              <ResultsColumn title="Main Course" items={results.data.mains} />
              <ResultsColumn title="Desserts" items={results.data.desserts} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;