import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultsColumnProps {
  title: string;
  items: Array<{ dish: string; restaurant: string }>;
}

const ResultsColumn = ({ title, items }: ResultsColumnProps) => {
  return (
    <Card className="h-[500px] overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 animate-scroll-slow">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-card-bg rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-text-primary">{item.dish}</h3>
              <p className="text-sm text-text-secondary">{item.restaurant}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsColumn;