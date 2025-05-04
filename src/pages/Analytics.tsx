import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, LineChart, PieChart, ResponsiveContainer, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { Activity, ChartPie, ChartBar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define type interfaces to fix the type errors
interface PriceHistory {
  unitprice: number;
  effdate: string;
}

interface ProductDetail {
  description: string;
  prodcode: string;
  unit?: string;
  pricehist?: PriceHistory[];
}

interface SalesDetail {
  quantity: number;
  product: ProductDetail;
}

interface Customer {
  custname: string;
}

interface Employee {
  firstname: string;
  lastname: string;
}

interface Sale {
  transno: string;
  salesdate: string;
  custno: string;
  customer: Customer;
  employee: Employee;
  salesdetail: SalesDetail[];
}

const Analytics: React.FC = () => {
  // Fetch sales data for analytics
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-analytics"],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`*, 
          customer:customer(custname),
          employee:employee(firstname, lastname),
          salesdetail:salesdetail(*, product:product(description, pricehist(unitprice, effdate)))
        `)
        .order('salesdate', { ascending: false });
      
      if (error) throw error;
      return sales as Sale[];
    },
  });

  // Fetch product data for analytics
  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ["product-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product')
        .select(`*, 
          pricehist:pricehist(unitprice, effdate),
          salesdetail:salesdetail(quantity)
        `);
      
      if (error) throw error;
      return data as ProductDetail[];
    },
  });

  // Process sales data by month for line chart
  const monthlySalesData = React.useMemo(() => {
    if (!salesData) return [];
    
    const monthlyData: Record<string, number> = {};
    
    salesData.forEach(sale => {
      if (!sale.salesdate) return;
      
      const date = new Date(sale.salesdate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      let saleTotal = 0;
      sale.salesdetail?.forEach(detail => {
        const quantity = Number(detail.quantity) || 0;
        // Using optional chaining to safely access potentially undefined properties
        const unitPrice = detail.product?.pricehist?.[0]?.unitprice || 0;
        saleTotal += quantity * unitPrice;
      });
      
      if (monthlyData[monthYear]) {
        monthlyData[monthYear] += saleTotal;
      } else {
        monthlyData[monthYear] = saleTotal;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
      });
  }, [salesData]);

  // Process product data for pie chart
  const productSalesData = React.useMemo(() => {
    if (!productData) return [];
    
    return productData
      .map(product => {
        const totalQuantity = product.salesdetail?.reduce((sum, detail) => 
          sum + (Number(detail.quantity) || 0), 0) || 0;
        
        return {
          name: product.description || product.prodcode,
          value: totalQuantity
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 products
  }, [productData]);

  // Calculate top customers
  const topCustomersData = React.useMemo(() => {
    if (!salesData) return [];
    
    const customerSales: Record<string, { name: string, value: number }> = {};
    
    salesData.forEach(sale => {
      if (!sale.custno || !sale.customer) return;
      
      const customerName = sale.customer.custname || sale.custno;
      let saleTotal = 0;
      
      sale.salesdetail?.forEach(detail => {
        const quantity = Number(detail.quantity) || 0;
        // Using optional chaining to safely access potentially undefined properties
        const unitPrice = detail.product?.pricehist?.[0]?.unitprice || 0;
        saleTotal += quantity * unitPrice;
      });
      
      if (customerSales[sale.custno]) {
        customerSales[sale.custno].value += saleTotal;
      } else {
        customerSales[sale.custno] = { name: customerName, value: saleTotal };
      }
    });
    
    return Object.values(customerSales)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 customers
  }, [salesData]);

  const pieColors = ["#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", "#E5DEFF"];

  const isLoading = salesLoading || productsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Analytics Report</h1>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ChartPie className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Monthly Sales
                  </CardTitle>
                  <CardDescription>Sales performance over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ChartContainer 
                      config={{
                        sales: {
                          label: "Sales",
                          color: "#9b87f5"
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySalesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            name="sales" 
                            stroke="#9b87f5" 
                            strokeWidth={2} 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartPie className="h-5 w-5 text-primary" />
                    Top Products
                  </CardTitle>
                  <CardDescription>Best selling products by quantity</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ChartContainer 
                      config={{
                        products: {
                          label: "Products",
                          theme: { light: "#9b87f5", dark: "#7E69AB" }
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={productSalesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {productSalesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Sales Analysis</CardTitle>
                <CardDescription>Detailed breakdown of product performance</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      quantity: {
                        label: "Quantity Sold",
                        color: "#9b87f5"
                      }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={productSalesData} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={80}
                          tickFormatter={(value) => 
                            value.length > 15 ? `${value.slice(0, 15)}...` : value
                          } 
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="value" name="quantity" fill="#9b87f5" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Customers with highest sales value</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      sales: {
                        label: "Sales Value",
                        color: "#7E69AB"
                      }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topCustomersData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={80}
                          tickFormatter={(value) => 
                            value.length > 15 ? `${value.slice(0, 15)}...` : value
                          } 
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="value" name="sales" fill="#7E69AB" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>Monthly sales performance analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      monthlySales: {
                        label: "Monthly Sales",
                        color: "#6E59A5"
                      }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlySalesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="amount" name="monthlySales" fill="#6E59A5" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
