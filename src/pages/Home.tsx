import React, { useState, useCallback } from "react";
import {
  Hero,
  WhySection,
  TrustLayer,
  AdvisorsPmsSplit,
  HowItWorks,
  FloatingButton,
  CTASection,
  RegionsSection,
  ProofSection,
  Footer
} from "../components/home/index";
import AuthModal from "../components/AuthModal";
import { UnifiedHeader } from "../components/Header";

export const Home: React.FC = () => {
  // Estado del modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Función para abrir el modal
  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // Función para cerrar el modal
  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // Función cuando el usuario se autentica exitosamente
  const handleAuthSuccess = useCallback((user: any) => {
    console.log('✅ Auth success:', user);
    closeAuthModal();
    
    // Disparar evento para actualizar el contexto de auth
    window.dispatchEvent(new Event('authStateChange'));
  }, [closeAuthModal]);

  return (
    <div className="min-h-screen bg-background font-[Inter]">
      {/* Header unificado en modo simple */}
      <UnifiedHeader 
        mode="simple"
        onAuthClick={openAuthModal} 
      />
      
      <Hero />
      <WhySection />
      <TrustLayer />
      <AdvisorsPmsSplit />
      <HowItWorks />
      <ProofSection />
      <RegionsSection />
      <CTASection onAuthClick={openAuthModal} />
      <Footer />
      <FloatingButton />

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