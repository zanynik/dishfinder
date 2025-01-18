import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AddForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    city: "",
    restaurant: "",
    dish: "",
    category: "appetizer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, insert or get the restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .upsert(
          {
            name: formData.restaurant,
            city: formData.city
          },
          { onConflict: 'name' }
        )
        .select()
        .single();

      if (restaurantError) {
        throw restaurantError;
      }

      // Then insert the dish with the restaurant_id
      const { error: dishError } = await supabase
        .from('dishes')
        .insert({
          name: formData.dish,
          type: formData.category,
          restaurant_id: restaurantData.id,
          upvotes: 0,
          downvotes: 0
        });

      if (dishError) {
        throw dishError;
      }

      toast({
        title: "Added Successfully",
        description: "The restaurant and dish have been added to our database.",
      });

      setFormData({
        city: "",
        restaurant: "",
        dish: "",
        category: "appetizer",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the restaurant/dish to the database.",
        variant: "destructive",
      });
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
      <Input
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        required
      />
      <Input
        placeholder="Restaurant Name"
        value={formData.restaurant}
        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
        required
      />
      <Input
        placeholder="Dish Name"
        value={formData.dish}
        onChange={(e) => setFormData({ ...formData, dish: e.target.value })}
        required
      />
      <select
        className="w-full p-2 border rounded"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="appetizer">Appetizer</option>
        <option value="main">Main Course</option>
        <option value="dessert">Dessert</option>
      </select>
      <Button type="submit" className="w-full">Add Restaurant/Dish</Button>
    </form>
  );
};

export default AddForm;