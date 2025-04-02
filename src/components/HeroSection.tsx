
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="px-4 py-20 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none animate-fade-in">
                Effortlessly track product <span className="text-gradient">prices</span> and manage inventory
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Keep your product catalog up to date, monitor price history, and make data-driven decisions with ProSync.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/signup">
                <Button size="lg" className="btn-hover">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="btn-hover">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-3xl opacity-50"></div>
              <div className="relative rounded-lg overflow-hidden border border-border glass-card w-full h-full p-2 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <div className="relative w-full h-full bg-gray-900 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2426&h=1728"
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-md bg-background/90 backdrop-blur-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Product Analytics</div>
                      <div className="text-xs text-muted-foreground">Monthly Report</div>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4 animate-pulse-subtle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
