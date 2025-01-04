import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AddForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    city: "",
    restaurant: "",
    dish: "",
    category: "appetizer",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would add to a database
    toast({
      title: "Added Successfully",
      description: "The restaurant/dish has been added to our database.",
    });
    setFormData({
      city: "",
      restaurant: "",
      dish: "",
      category: "appetizer",
    });
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