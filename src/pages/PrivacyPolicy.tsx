import React, { useCallback, useState } from "react";
import { UnifiedHeader } from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import {
  HeroSection,
  PrivacyContentSection,
} from "../components/privacy-policy/index";

export const PrivacyPolicy: React.FC = () => {
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
      <PrivacyContentSection />
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