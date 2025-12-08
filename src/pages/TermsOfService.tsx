import React, { useCallback, useState } from "react";
import { UnifiedHeader } from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import {
  HeroSection,
  TermsContentSection,
} from "../components/terms-of-service/index";

export const TermsOfService: React.FC = () => {
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
    window.dispatchEvent(new Event("authStateChange"));
  }, [closeAuthModal]);

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader mode="simple" onAuthClick={openAuthModal} />
      <HeroSection />
      <TermsContentSection />
      <Footer />

      {showAuthModal && (
        <AuthModal
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};