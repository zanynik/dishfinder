import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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
  return (
    <Card className="h-[500px] overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 animate-scroll-slow">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
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