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

// ✅ Estado del modal de auth:
// - 'email'    → paso inicial (ingresar email)
// - 'password' → usuario existente, ingresar contraseña (NUEVO)
// - 'code'     → flujo de código (comentado, conservado para nuevos usuarios)
interface AuthModalState {
  open: boolean;
  initialEmail?: string;
  initialMode?: 'email' | 'code' | 'password';
}

export const Home: React.FC = () => {
  const [authModal, setAuthModal] = useState<AuthModalState>({ open: false });
  const [showRankModal, setShowRankModal] = useState(false);

  // Abre el modal en modo email normal (desde el header → botón "Login")
  const openAuthModal = useCallback(() =>
    setAuthModal({ open: true, initialMode: 'email' }), []);

  // ✅ Abre el modal directamente en el paso de password para usuarios existentes.
  // Se llama desde Hero y CTASection cuando el usuario ingresa su email
  // en el campo de la landing y el backend confirma que ya existe en BD.
  const openAuthModalWithPassword = useCallback((email: string) =>
    setAuthModal({ open: true, initialEmail: email, initialMode: 'password' }), []);

  // -- Función anterior para abrir en modo 'code' — ya no se usa como entrada
  // principal, pero se conserva por si se reactiva el flujo de código. --
  /*
  const openAuthModalWithCode = useCallback((email: string) =>
    setAuthModal({ open: true, initialEmail: email, initialMode: 'code' }), []);
  */

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

      {/* ✅ Se pasa openAuthModalWithPassword en lugar de openAuthModalWithCode */}
      <Hero onOpenAuthWithCode={openAuthModalWithPassword} />
      <FeaturesSection />
      <TrustLayer />
      <WhiteLabelSection />
      <RegionsSection />
      <CTASection onOpenAuthWithCode={openAuthModalWithPassword} />
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