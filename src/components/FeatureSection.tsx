
import { 
  LineChart, 
  Image, 
  History, 
  Search, 
  BarChart4, 
  Bell 
} from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="rounded-full p-3 bg-primary/10 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function FeatureSection() {
  const features = [
    {
      title: "Price History Tracking",
      description: "Track and analyze price changes over time with interactive historical data visualizations.",
      icon: <History className="h-6 w-6 text-primary" />
    },
    {
      title: "Advanced Analytics",
      description: "Gain insights through comprehensive analytics tools with customizable reports and dashboards.",
      icon: <LineChart className="h-6 w-6 text-primary" />
    },
    {
      title: "Product Catalog",
      description: "Manage your entire product catalog with detailed information, images, and categorization.",
      icon: <Image className="h-6 w-6 text-primary" />
    },
    {
      title: "Powerful Search",
      description: "Quickly find products with advanced filtering and search capabilities across your database.",
      icon: <Search className="h-6 w-6 text-primary" />
    },
    {
      title: "Sales Reporting",
      description: "Generate comprehensive sales reports to identify trends and make data-driven decisions.",
      icon: <BarChart4 className="h-6 w-6 text-primary" />
    },
    {
      title: "Price Alerts",
      description: "Get notified about significant price changes in your monitored products and competitor offerings.",
      icon: <Bell className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Complete Product Management Solution
          </h2>
          <p className="text-muted-foreground md:text-xl max-w-[800px]">
            ProSync provides everything you need to manage your product catalog, track pricing, and gain valuable insights.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="animate-fade-in" 
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Feature
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
