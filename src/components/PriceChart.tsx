
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import type { PriceHistory } from "@/lib/mockData";

interface PriceChartProps {
  priceHistory: PriceHistory[];
}

interface ChartData {
  date: string;
  price: number;
  formattedDate: string;
  note?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory }) => {
  const chartData: ChartData[] = React.useMemo(() => {
    return priceHistory
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: item.date,
        formattedDate: formatDate(item.date),
        price: item.price,
        note: item.note
      }));
  }, [priceHistory]);

  if (chartData.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Not enough price history to display chart</p>
        </CardContent>
      </Card>
    );
  }

  const minPrice = Math.min(...chartData.map(item => item.price)) * 0.95;
  const maxPrice = Math.max(...chartData.map(item => item.price)) * 1.05;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-medium">{data.formattedDate}</p>
          <p className="text-primary">{`$${data.price.toFixed(2)}`}</p>
          {data.note && <p className="text-xs text-muted-foreground">{data.note}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="formattedDate" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => {
                  // Abbreviate date string to save space
                  return value.split(" ")[0];
                }}
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => `$${value}`}
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
