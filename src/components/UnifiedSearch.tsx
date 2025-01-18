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
    type: "city" | "restaurant" | "dish" | null;
    data: any;
  }>({ type: null, data: null });

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

  const handleSearch = async () => {
    const { dish, city, restaurant } = search;

    let query = supabase
      .from('dishes')
      .select(`
        id,
        name,
        type,
        upvotes,
        downvotes,
        restaurants!inner (
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

    const processedData = dishesData?.map((dish: Dish) => ({
      id: dish.id,
      dish: dish.name,
      restaurant: dish.restaurants?.name || 'Unknown Restaurant',
      upvotes: dish.upvotes || 0,
      downvotes: dish.downvotes || 0,
      score: (dish.upvotes || 0) - (dish.downvotes || 0),
    }));

    const groupedData = processedData?.reduce((acc: any, dish: any) => {
      if (!acc[dish.type]) {
        acc[dish.type] = [];
      }
      acc[dish.type].push(dish);
      return acc;
    }, {});

    setResults({
      type: restaurant ? 'restaurant' : city ? 'city' : 'dish',
      data: {
        appetizers: (groupedData?.appetizer || []).sort((a: any, b: any) => b.score - a.score),
        mains: (groupedData?.main || []).sort((a: any, b: any) => b.score - a.score),
        desserts: (groupedData?.dessert || []).sort((a: any, b: any) => b.score - a.score),
      },
    });
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

      {results.type && (
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
    </div>
  );
};

export default UnifiedSearch;