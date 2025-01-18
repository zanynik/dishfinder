import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ResultsColumn from "./ResultsColumn";
import { supabase } from "@/integrations/supabase/client";

interface Dish {
  id: number;
  name: string;
  type: string;
  restaurant_id: number;
  upvotes: number;
  downvotes: number;
  restaurants: {
    name: string;
    city: string;
  } | null;
}

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

  const handleVote = async (dishId: number, isUpvote: boolean) => {
    const { data: currentDish } = await supabase
      .from('dishes')
      .select('upvotes, downvotes')
      .eq('id', dishId)
      .single();

    if (!currentDish) {
      toast({
        title: "Error",
        description: "Dish not found",
        variant: "destructive",
      });
      return;
    }

    const newCount = (currentDish[isUpvote ? 'upvotes' : 'downvotes'] || 0) + 1;

    const { error } = await supabase
      .from('dishes')
      .update({
        [isUpvote ? 'upvotes' : 'downvotes']: newCount,
      })
      .eq('id', dishId);

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

  const buildApiQuery = () => {
    const { dish, city, restaurant } = search;
    let query = "SELECT name, restaurant_name, identifier, price_usd FROM `menu_items` WHERE 1=1";

    if (dish) {
      query += ` AND name LIKE '%${dish}%'`;
    }
    if (city) {
      query += ` AND identifier LIKE '%${city}%'`;
    }
    if (restaurant) {
      query += ` AND restaurant_name LIKE '%${restaurant}%'`;
    }

    query += ` LIMIT 10`;
    return encodeURIComponent(query);
  };

  const fetchAndStoreMenuItems = async () => {
    const query = buildApiQuery();
    const url = `https://www.dolthub.com/api/v1alpha1/dolthub/menus/master?q=${query}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.rows && data.rows.length > 0) {
        for (const row of data.rows) {
          // First, insert or get restaurant
          const { data: restaurantData, error: restaurantError } = await supabase
            .from('restaurants')
            .upsert(
              {
                name: row.restaurant_name,
                city: row.identifier || 'Unknown'
              },
              { onConflict: 'name' }
            )
            .select()
            .single();

          if (restaurantError) {
            console.error('Error inserting restaurant:', restaurantError);
            continue;
          }

          // Then, insert the dish with restaurant_id
          const { error: dishError } = await supabase
            .from('dishes')
            .insert({
              name: row.name,
              type: row.price_usd < 10 ? "appetizer" : "main",
              restaurant_id: restaurantData.id,
              upvotes: 0,
              downvotes: 0
            });

          if (dishError) {
            console.error('Error inserting dish:', dishError);
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

  const handleSearch = async () => {
    const { dish, city, restaurant } = search;

    // Fetch and store data from external API
    await fetchAndStoreMenuItems();

    let query = supabase
      .from('dishes')
      .select(`
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
      `);

    // Build the query based on search criteria
    if (dish) {
      query = query.ilike('name', `%${dish}%`);
    }
    
    if (city) {
      query = query.ilike('restaurants.city', `%${city}%`);
    }
    
    if (restaurant) {
      query = query.ilike('restaurants.name', `%${restaurant}%`);
    }
  
    const { data: dishesData, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
      return;
    }


    const processedData = dishesData
    ?.filter((dish) => dish.restaurants?.name && dish.restaurants?.city) // Filter out dishes without restaurant or city
    .map((dish) => ({
      id: dish.id,
      dish: dish.name,
      type: dish.type?.toLowerCase() || 'other',
      restaurant: dish.restaurants.name,
      city: dish.restaurants.city,
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
    const uniqueTypes = [...new Set(processedData.map(dish => dish.type))];

    if (uniqueTypes.length === 1) {
      // Single type - split into high/low rated
      const sortedDishes = [...processedData].sort((a, b) => b.score - a.score);
      const midPoint = Math.ceil(sortedDishes.length / 2);
      
      setResults({
        type: 'single',
        data: {
          highlyRated: sortedDishes.slice(0, midPoint),
          leastRated: sortedDishes.slice(midPoint).reverse() // reverse to show lowest scores
        }
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
        type: 'multiple',
        data: {
          appetizers: (groupedData?.appetizer || []).sort((a, b) => b.score - a.score),
          mains: (groupedData?.main || []).sort((a, b) => b.score - a.score),
          desserts: (groupedData?.dessert || []).sort((a, b) => b.score - a.score),
        }
      });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dishes'
        },
        () => {
          handleSearch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [search]);

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

      {results.type === 'multiple' && (
        <div className="grid grid-cols-3 gap-6">
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
      )}

      {results.type === 'single' && (
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
      )}
    </div>
  );
};

export default UnifiedSearch;