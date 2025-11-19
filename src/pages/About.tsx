import React from "react";
import {
  Header,
  HeroSection,
  DifferenceSection,
  StorySection,
  VisionSection,
  FoundersSection,
  CTASection,
  Footer
} from "../components/about/index";

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <DifferenceSection />
      <StorySection />
      <VisionSection />
      <FoundersSection />
      <CTASection />
      <Footer />
    </div>
  );
};