import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DishWithScore {
  id: number;
  dish: string;
  restaurant: string;
  city: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

interface ResultsColumnProps {
  title: string;
  items: DishWithScore[];
  onVote: (dishId: number, isUpvote: boolean) => void;
}

const ResultsColumn = ({ title, items, onVote }: ResultsColumnProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  const scrollSpeed = 0.5; // Adjust scroll speed (pixels per frame)

  const startScrolling = () => {
    if (!scrollContainerRef.current || !scrollContentRef.current) return;

    const container = scrollContainerRef.current;
    const content = scrollContentRef.current;

    const scroll = () => {
      if (!isHovered) {
        scrollPositionRef.current += scrollSpeed;

        // Reset scroll position if it exceeds content height
        if (scrollPositionRef.current >= content.clientHeight) {
          scrollPositionRef.current = 0;
        }

        container.scrollTop = scrollPositionRef.current;
      }

      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    animationFrameRef.current = requestAnimationFrame(scroll);
  };

  useEffect(() => {
    startScrolling();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  return (
    <Card className="h-[500px] overflow-hidden relative">
      <CardHeader>
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent
        ref={scrollContainerRef}
        className="h-[calc(100%-56px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div ref={scrollContentRef}>
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
            >
              <h3 className="font-semibold text-foreground">{item.dish}</h3>
              <p className="text-sm text-muted-foreground">
                {item.restaurant} • {item.city}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(item.id, true)}
                    className="h-8 px-2"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {item.upvotes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(item.id, false)}
                    className="h-8 px-2"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {item.downvotes}
                  </Button>
                </div>
                <span className="text-sm font-medium">
                  Score: {item.score}
                </span>
              </div>
            </div>
          ))}
          {/* Add duplicate content for infinite scroll effect */}
          {items.map((item) => (
            <div
              key={`${item.id}-duplicate`}
              className="p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
            >
              <h3 className="font-semibold text-foreground">{item.dish}</h3>
              <p className="text-sm text-muted-foreground">
                {item.restaurant} • {item.city}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(item.id, true)}
                    className="h-8 px-2"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {item.upvotes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(item.id, false)}
                    className="h-8 px-2"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {item.downvotes}
                  </Button>
                </div>
                <span className="text-sm font-medium">
                  Score: {item.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsColumn;