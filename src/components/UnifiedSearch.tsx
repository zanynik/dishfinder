import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTopDishes } from "@/hooks/useTopDishes";
import { buildApiQuery, toTitleCase } from "@/lib/utils";
import { SearchForm } from "@/components/SearchForm";
import ResultsColumn from "./ResultsColumn";
import { Loader2 } from "lucide-react";

const UnifiedSearch = () => {
  const [search, setSearch] = useState({
    dish: "",
    city: "",
    restaurant: "",
  });

  const [results, setResults] = useState<{
    type: "city" | "restaurant" | "dish" | "single" | "multiple" | null;
    data: any;
  }>({ type: null, data: null });

  const [apiOffset, setApiOffset] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state

  const topDishes = useTopDishes();

  useEffect(() => {
    if (topDishes) {
      setResults(topDishes);
    }
  }, [topDishes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setSearch({ ...search, [field]: e.target.value });
  };

  const handleVote = async (dishId: number, isUpvote: boolean) => {
    const { data: currentDish } = await supabase
      .from("dishes")
      .select("upvotes, downvotes")
      .eq("id", dishId)
      .single();

    if (!currentDish) {
      toast({
        title: "Error",
        description: "Dish not found",
        variant: "destructive",
      });
      return;
    }

    const newCount = (currentDish[isUpvote ? "upvotes" : "downvotes"] || 0) + 1;

    const { error } = await supabase
      .from("dishes")
      .update({
        [isUpvote ? "upvotes" : "downvotes"]: newCount,
      })
      .eq("id", dishId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update vote",
        variant: "destructive",
      });
    } else {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    const { dish, city, restaurant } = search;

    // Fetch and store data from external API
    await fetchAndStoreMenuItems();

    let query = supabase
      .from("dishes")
      .select(
        `
        id,
        name,
        type,
        restaurant_id,
        upvotes,
        downvotes,
        restaurants (
          name,
          city
        )
      `
      );

    // Build the query based on search criteria
    if (dish) {
      query = query.ilike("name", `%${dish}%`);
    }

    if (city) {
      query = query.ilike("restaurants.city", `%${city}%`);
    }

    if (restaurant) {
      query = query.ilike("restaurants.name", `%${restaurant}%`);
    }

    const { data: dishesData, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const processedData = dishesData
      ?.filter((dish) => dish.restaurants?.name && dish.restaurants?.city) // Filter out dishes without restaurant or city
      .map((dish) => ({
        id: dish.id,
        dish: dish.name, // Already in title case
        type: dish.type?.toLowerCase() || "other",
        restaurant: dish.restaurants.name, // Already in title case
        city: dish.restaurants.city, // Already in title case
        upvotes: dish.upvotes || 0,
        downvotes: dish.downvotes || 0,
        score: (dish.upvotes || 0) - (dish.downvotes || 0),
      }));

    if (!processedData?.length) {
      setResults({ type: null, data: null });
      toast({
        title: "No results found",
        description: "Try adjusting your search criteria",
      });
      return;
    }

    // Get unique types from results
    const uniqueTypes = [...new Set(processedData.map((dish) => dish.type))];

    if (uniqueTypes.length === 1) {
      // Single type - split into high/low rated
      const sortedDishes = [...processedData].sort((a, b) => b.score - a.score);
      const midPoint = Math.ceil(sortedDishes.length / 2);

      setResults({
        type: "single",
        data: {
          highlyRated: sortedDishes.slice(0, midPoint),
          leastRated: sortedDishes.slice(midPoint).reverse(), // reverse to show lowest scores
        },
      });
    } else {
      // Multiple types - group by type
      const groupedData = processedData.reduce((acc, dish) => {
        const type = dish.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(dish);
        return acc;
      }, {} as Record<string, any[]>);

      // Sort each category by score
      setResults({
        type: "multiple",
        data: {
          appetizers: (groupedData?.appetizer || []).sort((a, b) => b.score - a.score),
          mains: (groupedData?.main || []).sort((a, b) => b.score - a.score),
          desserts: (groupedData?.dessert || []).sort((a, b) => b.score - a.score),
        },
      });
    }
    setLoading(false); 
  };

  const fetchAndStoreMenuItems = async () => {
    const query = buildApiQuery(search);
    const url = `https://www.dolthub.com/api/v1alpha1/dolthub/menus/master?q=${query}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.rows && data.rows.length > 0) {
        for (const row of data.rows) {
          const dishName = toTitleCase(row.name);
          const restaurantName = toTitleCase(row.restaurant_name);
          const cityName = toTitleCase(row.identifier);

          // Generate random upvotes and downvotes between 0 and 100
          const randomUpvotes = Math.floor(Math.random() * 20); // Random integer from 0 to 100
          const randomDownvotes = Math.floor(Math.random() * 10); // Random integer from 0 to 100

          // First, insert or get restaurant
          const { data: restaurantData, error: restaurantError } = await supabase
            .from("restaurants")
            .upsert(
              {
                name: restaurantName,
                city: cityName,
              },
              { onConflict: "name" }
            )
            .select()
            .single();

          if (restaurantError) {
            console.error("Error inserting restaurant:", restaurantError);
            continue;
          }

          // Then, insert the dish with restaurant_id
          const { error: dishError } = await supabase.from("dishes").upsert({
            name: dishName,
            type: row.price_usd < 10 ? "appetizer" : "main",
            restaurant_id: restaurantData.id,
            upvotes: randomUpvotes, // Set random upvotes
            downvotes: randomDownvotes, // Set random downvotes
          });

          if (dishError) {
            console.error("Error inserting dish:", dishError);
          }
        }

        toast({
          title: "Success",
          description: "Data from API has been stored",
        });
        setApiOffset(apiOffset + 10);
      } else {
        toast({
          title: "No data fetched from API",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data from API",
        variant: "destructive",
      });
    }
  };

  // Generate dynamic heading text
  const getHeadingText = () => {
    let dishText = "Dishes";
    let locationText = "the World";

    if (search.dish) {
      dishText = search.dish;
    }

    if (search.city) {
      locationText = search.city;
    } else if (search.restaurant) {
      locationText = search.restaurant;
    }

    return `Top Rated ${dishText} in ${locationText}`;
  };

  return (
    <div className="space-y-6">
      <SearchForm search={search} onSearchChange={handleSearchChange} onSearch={handleSearch} />

      {/* Dynamic Heading */}
      <h2 className="text-2xl font-semibold text-center">
        {getHeadingText()}
      </h2>

      {/* Loader or Results */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" /> {/* Loader icon */}
        </div>
      ) : results.type === "multiple" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResultsColumn
            title="Appetizers"
            items={results.data.appetizers}
            onVote={handleVote}
          />
          <ResultsColumn
            title="Main Course"
            items={results.data.mains}
            onVote={handleVote}
          />
          <ResultsColumn
            title="Desserts"
            items={results.data.desserts}
            onVote={handleVote}
          />
        </div>
      ) : results.type === "single" ? (
        <div className="grid grid-cols-2 gap-6">
          <ResultsColumn
            title="Highly Rated"
            items={results.data.highlyRated}
            onVote={handleVote}
          />
          <ResultsColumn
            title="Least Rated"
            items={results.data.leastRated}
            onVote={handleVote}
          />
        </div>
      ) : null}
    </div>
  );
};

export default UnifiedSearch;