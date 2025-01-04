import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CitySearch from "./CitySearch";
import RestaurantSearch from "./RestaurantSearch";
import DishSearch from "./DishSearch";

const SearchTabs = () => {
  return (
    <Tabs defaultValue="city" className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="city">Search by City</TabsTrigger>
        <TabsTrigger value="restaurant">Search by Restaurant</TabsTrigger>
        <TabsTrigger value="dish">Search by Dish</TabsTrigger>
      </TabsList>
      <TabsContent value="city">
        <CitySearch />
      </TabsContent>
      <TabsContent value="restaurant">
        <RestaurantSearch />
      </TabsContent>
      <TabsContent value="dish">
        <DishSearch />
      </TabsContent>
    </Tabs>
  );
};

export default SearchTabs;