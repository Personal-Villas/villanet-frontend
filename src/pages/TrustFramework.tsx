import React, { useCallback, useState } from "react";
import { UnifiedHeader } from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import {
  HeroSection,
  NavSticky,
  PrinciplesSection,
  RankFrameworkSection,
  AdmissionStandardsSection,
  TermsSection,
  PrivacySection,
  ContactSection
} from "../components/trust-framework/index";
import { useScrollToHash } from "../hooks/useScrollToHash";

export const TrustFramework: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  useScrollToHash();

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
      <NavSticky />
      <PrinciplesSection />
      <RankFrameworkSection />
      <AdmissionStandardsSection />
      <TermsSection />
      <PrivacySection />
      <ContactSection />
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