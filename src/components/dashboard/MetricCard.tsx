
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { MetricCard } from "./types";

interface MetricCardComponentProps {
  data: MetricCard;
}

const MetricCardComponent: React.FC<MetricCardComponentProps> = ({ data }) => {
  return (
    <Card className="border-primary/20 shadow-md hover:shadow-colored hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{data.title}</p>
            <div className="text-2xl font-bold">{data.value}</div>
            
            {data.change && (
              <p className="text-xs flex items-center mt-1">
                {data.change.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data.change.isPositive ? "text-green-600" : "text-red-600"}>
                  {data.change.value}
                </span>
              </p>
            )}
          </div>
          
          <div className="p-2 bg-primary/10 rounded-lg">
            {data.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCardComponent;
