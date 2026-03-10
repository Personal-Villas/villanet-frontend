import React, { useState, useCallback } from "react";
import {
  Hero,
  FeaturesSection,
  TrustLayer,
  WhiteLabelSection,
  FloatingButton,
  CTASection,
  RegionsSection,
  Footer,
} from "../components/home/index";
import AuthModal from "../components/AuthModal";
import { UnifiedHeader } from "../components/Header";
import VillaNetRankModal from "../components/VillaNetRankModal";

export const Home: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);
  const openRankModal = () => setShowRankModal(true);
  const closeRankModal = () => setShowRankModal(false);

  const handleAuthSuccess = useCallback(
    (user: any) => {
      console.log("✅ Auth success:", user);
      closeAuthModal();
      window.dispatchEvent(new Event("authStateChange"));
    },
    [closeAuthModal]
  );

  return (
    // font-[Inter] fuerza Inter en toda la home, igual que Lovable
    <div className="min-h-screen bg-background font-[Inter]">
      <UnifiedHeader mode="simple" onAuthClick={openAuthModal} />

      <Hero />
      <FeaturesSection />
      <TrustLayer />
      <WhiteLabelSection />
      <RegionsSection />
      <CTASection />
      <Footer />
      <FloatingButton onClick={openRankModal} />

      <VillaNetRankModal isOpen={showRankModal} onClose={closeRankModal} />

      {showAuthModal && (
        <AuthModal onClose={closeAuthModal} onSuccess={handleAuthSuccess} />
      )}

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-subtle {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
        `}
      </style>
    </div>
  );
};