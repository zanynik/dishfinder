import SearchTabs from "@/components/SearchTabs";
import AddForm from "@/components/AddForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Global Food Explorer
          </h1>
          <p className="text-text-secondary">
            Discover the best dishes from restaurants around the world
          </p>
        </header>

        <SearchTabs />
        
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold text-text-primary text-center mb-6">
            Add a Restaurant or Dish
          </h2>
          <AddForm />
        </div>
      </div>
    </div>
  );
};

export default Index;