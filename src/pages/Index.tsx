
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
