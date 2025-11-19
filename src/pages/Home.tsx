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
import VillaNetRankModal from "../components/VillaNetRankModal";

export const Home: React.FC = () => {
  // Estado del modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);

  // Función para abrir el modal
  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // Función para cerrar el modal
  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const openRankModal = () => {
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
  };

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
      <FloatingButton onClick={openRankModal}/>

      {/* Modal de Villa Net Rank */}
      <VillaNetRankModal 
        isOpen={showRankModal}
        onClose={closeRankModal}
      />

      {/* Modal de Auth */}
      {showAuthModal && (
        <AuthModal 
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
      
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse-subtle {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }
        `}
      </style>
    </div>
  );
};