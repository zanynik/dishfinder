import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useTopDishes = () => {
  const [results, setResults] = useState<any>(null);

  const fetchTopDishes = async () => {
    try {
      // Fetch top 10 dishes for each type
      const { data: appetizers } = await supabase
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
        )
        .eq("type", "appetizer")
        .order("upvotes", { ascending: false })
        .limit(10);

      const { data: mains } = await supabase
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
        )
        .eq("type", "main")
        .order("upvotes", { ascending: false })
        .limit(10);

      const { data: desserts } = await supabase
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
        )
        .eq("type", "dessert")
        .order("upvotes", { ascending: false })
        .limit(10);

      // Process the fetched data
      const processedData = {
        appetizers: appetizers?.map((dish) => ({
          id: dish.id,
          dish: dish.name,
          type: dish.type,
          restaurant: dish.restaurants?.name,
          city: dish.restaurants?.city,
          upvotes: dish.upvotes || 0,
          downvotes: dish.downvotes || 0,
          score: (dish.upvotes || 0) - (dish.downvotes || 0),
        })) || [],
        mains: mains?.map((dish) => ({
          id: dish.id,
          dish: dish.name,
          type: dish.type,
          restaurant: dish.restaurants?.name,
          city: dish.restaurants?.city,
          upvotes: dish.upvotes || 0,
          downvotes: dish.downvotes || 0,
          score: (dish.upvotes || 0) - (dish.downvotes || 0),
        })) || [],
        desserts: desserts?.map((dish) => ({
          id: dish.id,
          dish: dish.name,
          type: dish.type,
          restaurant: dish.restaurants?.name,
          city: dish.restaurants?.city,
          upvotes: dish.upvotes || 0,
          downvotes: dish.downvotes || 0,
          score: (dish.upvotes || 0) - (dish.downvotes || 0),
        })) || [],
      };

      setResults({
        type: "multiple",
        data: processedData,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch top dishes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTopDishes();
  }, []);

  return results;
};