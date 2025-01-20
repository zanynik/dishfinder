import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFormProps {
  search: {
    dish: string;
    city: string;
    restaurant: string;
  };
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onSearch: () => void;
}

export const SearchForm = ({ search, onSearchChange, onSearch }: SearchFormProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Input
        placeholder="Enter dish name..."
        value={search.dish}
        onChange={(e) => onSearchChange(e, "dish")}
        className="flex-1"
      /> OR
      <Input
        placeholder="Enter (USA) city name..."
        value={search.city}
        onChange={(e) => onSearchChange(e, "city")}
        className="flex-1"
      /> OR 
      <Input
        placeholder="Enter restaurant name..."
        value={search.restaurant}
        onChange={(e) => onSearchChange(e, "restaurant")}
        className="flex-1"
      />
      <Button onClick={onSearch} className="md:w-24">
        Search
      </Button>
    </div>
  );
};