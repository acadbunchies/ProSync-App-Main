
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="relative rounded-3xl overflow-hidden border border-border glass-card p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-50 -z-10"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-10 -z-10"></div>
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to streamline your product management?
              </h2>
              <p className="text-muted-foreground">
                Join thousands of businesses using ProSync to organize their product catalogs, track price changes, and make better decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/signup">
                  <Button size="lg" className="btn-hover w-full sm:w-auto">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="btn-hover w-full sm:w-auto">
                    Contact sales
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center animate-slide-in-right">
              <div className="rounded-lg overflow-hidden border border-border glass-card p-1 shadow-lg">
                <div className="bg-card rounded-md overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&h=1067"
                    alt="Product Dashboard"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
