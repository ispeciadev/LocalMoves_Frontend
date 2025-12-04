import React from "react";
import HeroSection from "../components/HeroSection";
import PartnerLogos from "../components/PartnerLogos";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";
import HappyStories from "../components/HappyStoriesSection";
// import MoveDetailsModal from "../components/MoveDetailsModal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <PartnerLogos />
      <FeaturesSection />
      <FAQSection />
      <HappyStories />
      {/* <MoveDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onSubmit={handleSubmitDetails}
      /> */}
      
    </div>
  );
}
