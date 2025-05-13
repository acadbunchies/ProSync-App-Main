
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import FeatureSection from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="mt-1">
        <CheckCircle className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4"
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Powerful Product Management Solutions
            </h1>
            <p className="text-muted-foreground md:text-xl max-w-[800px]">
              ProSync offers comprehensive tools to help your business manage products, track pricing history,
              and make data-driven decisions with powerful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link to="/signup">
                <Button size="lg" className="button-pop">Get Started</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="button-pop">
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* Detailed Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              ProSync Detailed Features
            </h2>
            <p className="text-muted-foreground md:text-xl max-w-[800px]">
              Discover how our advanced product management platform can transform your business operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <Card className="border border-border/50">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Product Management</h3>
                <div className="space-y-4">
                  <FeatureItem 
                    title="Complete Product Catalog" 
                    description="Maintain a comprehensive database of all your products with customizable fields and categories."
                  />
                  <FeatureItem 
                    title="Inventory Tracking" 
                    description="Monitor stock levels and receive alerts when products are running low."
                  />
                  <FeatureItem 
                    title="Bulk Operations" 
                    description="Update multiple products at once with our powerful batch editing tools."
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border/50">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Price Management</h3>
                <div className="space-y-4">
                  <FeatureItem 
                    title="Historical Price Tracking" 
                    description="Keep a detailed record of price changes over time for analysis and reporting."
                  />
                  <FeatureItem 
                    title="Competitive Price Monitoring" 
                    description="Compare your prices with competitors to ensure you remain competitive in the market."
                  />
                  <FeatureItem 
                    title="Price Optimization" 
                    description="Use AI-powered insights to optimize pricing for maximum profit margins."
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border/50">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Analytics & Reporting</h3>
                <div className="space-y-4">
                  <FeatureItem 
                    title="Interactive Dashboards" 
                    description="View key metrics and KPIs at a glance with customizable dashboard widgets."
                  />
                  <FeatureItem 
                    title="Custom Reports" 
                    description="Generate detailed reports on product performance, sales trends, and pricing strategies."
                  />
                  <FeatureItem 
                    title="Data Visualization" 
                    description="Transform complex data into clear visual insights with charts and graphs."
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border/50">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Collaboration Tools</h3>
                <div className="space-y-4">
                  <FeatureItem 
                    title="Team Workspace" 
                    description="Collaborate effectively with team members on product management tasks."
                  />
                  <FeatureItem 
                    title="Role-Based Access" 
                    description="Assign specific permissions to team members based on their responsibilities."
                  />
                  <FeatureItem 
                    title="Activity Tracking" 
                    description="Keep track of all changes made to products with a detailed activity log."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to Streamline Your Product Management?
            </h2>
            <p className="text-muted-foreground md:text-xl max-w-[800px]">
              Join thousands of businesses that trust ProSync for their product management needs.
            </p>
            <Link to="/signup" className="mt-6">
              <Button size="lg" className="button-pop">Start Your Free Trial</Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Features;
