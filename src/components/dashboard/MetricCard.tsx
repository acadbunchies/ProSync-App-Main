
import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard as MetricCardType } from "./types";

interface MetricCardProps {
  data: MetricCardType;
}

const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const { title, value, change, icon } = data;
  
  return (
    <Card className="p-4 flex flex-col gap-2 border border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 bg-secondary/70 rounded-md">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        {change && (
          <div className={cn(
            "flex items-center text-xs gap-1",
            change.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {change.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{change.value}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
