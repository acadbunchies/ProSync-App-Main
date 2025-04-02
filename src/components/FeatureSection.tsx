import { 
  LineChart, 
  Image, 
  History, 
  Laptop, 
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
      title: "Price History",
      description: "Track price changes over time to identify trends and optimize pricing strategy.",
      icon: <History className="h-6 w-6 text-primary" />
    },
    {
      title: "Visual Analytics",
      description: "Interactive charts and graphs to visualize your product performance.",
      icon: <LineChart className="h-6 w-6 text-primary" />
    },
    {
      title: "Product Images",
      description: "Store and manage high-quality images for your product catalog.",
      icon: <Image className="h-6 w-6 text-primary" />
    },
    {
      title: "Responsive Design",
      description: "Access your product data from any device with our responsive interface.",
      icon: <Laptop className="h-6 w-6 text-primary" />
    },
    {
      title: "Data Reports",
      description: "Generate detailed reports for better business decisions.",
      icon: <BarChart4 className="h-6 w-6 text-primary" />
    },
    {
      title: "Price Alerts",
      description: "Get notified about significant price changes in your monitored products.",
      icon: <Bell className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features for Product Management
          </h2>
          <p className="text-muted-foreground md:text-xl max-w-[800px]">
            Our comprehensive toolkit helps you stay on top of your product catalog and pricing strategy.
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
