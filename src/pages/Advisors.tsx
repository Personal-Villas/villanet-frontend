import React, { useCallback, useState } from "react";
import {
  Header,
  HeroSection,
  WhySection,
  BenefitsSection,
  FeaturesSection,
  CTASection,
  Footer
} from "../components/advisors/index";
import AuthModal from "../components/AuthModal";


export const Advisors: React.FC = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);

    const openAuthModal = useCallback(() => {
      setShowAuthModal(true);
    }, []);
  
    const closeAuthModal = useCallback(() => {
      setShowAuthModal(false);
    }, []);
  
    const handleAuthSuccess = useCallback((user: any) => {
      console.log("✅ Auth success:", user);
      closeAuthModal();
      // actualizar el contexto de auth igual que en Home
      window.dispatchEvent(new Event("authStateChange"));
    }, [closeAuthModal]); 
    
  return (
    <div className="min-h-screen bg-background">
      <Header mode="simple" onAuthClick={openAuthModal} />
      <HeroSection />
      <WhySection />
      <BenefitsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />

      {/* Modal de Auth */}
      {showAuthModal && (
        <AuthModal
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};