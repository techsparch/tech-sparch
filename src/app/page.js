"use client";

import AlternatingFeatures from "@/component/home/AlternatingFeatures/AlternatingFeatures";
import FeaturesSection from "@/component/home/Features/FeaturesSection";
import CTAAndFooter from "@/component/home/Footer/CTAAndFooter";
import Hero from "@/component/home/hero/hero";
import Navbar from "@/component/home/Nabvar/Navbar";
import PricingSection from "@/component/home/Pricing/PricingSection";
import HowItWorksSection from "@/component/home/Works/HowItWorksSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-light">
      {" "}
      {/* Added base background color */}
      {/* <UnderConstruction /> */}
      <Navbar />
      {/* Hero Section */}
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      {/* <PricingSection /> */}

      {/* <AlternatingFeatures/> */}
      {/* Second Section for Scroll Testing */}
      <CTAAndFooter />
    
    </div>
  );
}
