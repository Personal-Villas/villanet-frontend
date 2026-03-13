import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api/api";

interface CTASectionProps {
  // ✅ Callback para abrir AuthModal en paso de código cuando el usuario ya existe
  onOpenAuthWithCode: (email: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenAuthWithCode }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim()) {
      navigate("/advisor-signup");
      return;
    }

    if (!email.includes("@")) {
      navigate(`/advisor-signup?email=${encodeURIComponent(email)}`);
      return;
    }

    setLoading(true);

    try {
      // ✅ Verificar si el usuario existe enviando el código
      const response = await publicApi("/auth/send-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      }) as { userExists: boolean };

      if (response.userExists) {
        // ✅ Usuario existente: abrir modal directamente en el paso de código
        onOpenAuthWithCode(email);
      } else {
        // Usuario nuevo: flujo normal hacia signup
        navigate(`/advisor-signup?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error("❌ Error checking user:", err);
      // En caso de error, no bloqueamos al usuario — seguimos al signup
      navigate(`/advisor-signup?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cta" className="py-24 px-6 bg-foreground">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-background mb-6">
          Stop sourcing. Start closing.
        </h2>
        <p className="text-base text-background/60 mb-10 max-w-xl mx-auto">
          Join a global network built on transparency, operational excellence,
          and trusted relationships.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
          <input
            type="email"
            className="flex-1 h-14 px-5 rounded-xl bg-background text-foreground border-0 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-14 px-8 rounded-xl bg-background text-foreground font-medium uppercase tracking-wider text-sm whitespace-nowrap hover:bg-background/90 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Checking..." : "Get Instant Access"}
          </button>
        </div>

        <p className="text-xs text-background/40">
          Villa Net is a B2B-only platform. All advisor applications are
          manually verified within 24 hours.
        </p>
      </div>
    </section>
  );
};