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

// ✅ Estado del modal de auth: puede abrirse en modo 'email' normal
// o directamente en modo 'code' cuando el usuario ya existe
interface AuthModalState {
  open: boolean;
  initialEmail?: string;
  initialMode?: 'email' | 'code';
}

export const Home: React.FC = () => {
  const [authModal, setAuthModal] = useState<AuthModalState>({ open: false });
  const [showRankModal, setShowRankModal] = useState(false);

  // Abre el modal en modo email normal (desde el header)
  const openAuthModal = useCallback(() =>
    setAuthModal({ open: true, initialMode: 'email' }), []);

  // ✅ Abre el modal directamente en el paso de código para usuarios existentes
  const openAuthModalWithCode = useCallback((email: string) =>
    setAuthModal({ open: true, initialEmail: email, initialMode: 'code' }), []);

  const closeAuthModal = useCallback(() =>
    setAuthModal({ open: false }), []);

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
    <div className="min-h-screen bg-background font-[Inter]">
      <UnifiedHeader mode="simple" onAuthClick={openAuthModal} />

      <Hero onOpenAuthWithCode={openAuthModalWithCode} />
      <FeaturesSection />
      <TrustLayer />
      <WhiteLabelSection />
      <RegionsSection />
      <CTASection onOpenAuthWithCode={openAuthModalWithCode} />
      <Footer />
      <FloatingButton onClick={openRankModal} />

      <VillaNetRankModal isOpen={showRankModal} onClose={closeRankModal} />

      {authModal.open && (
        <AuthModal
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
          initialEmail={authModal.initialEmail}
          initialMode={authModal.initialMode}
        />
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