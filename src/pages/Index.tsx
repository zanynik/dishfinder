import UnifiedSearch from "@/components/UnifiedSearch";
import AddForm from "@/components/AddForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div 
        className="bg-gradient-to-r from-[#FDE1D3] to-[#F2FCE2] p-8 shadow-lg mb-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.1)), url('/images/background_banner.avif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#403E43] mb-4">
              DishFinder
            </h1>
            <p className="text-[#1A1F2C]">
              Discover the best dishes from restaurants around the world (Currently, US only)
            </p>
          </header>

          <UnifiedSearch />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">
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