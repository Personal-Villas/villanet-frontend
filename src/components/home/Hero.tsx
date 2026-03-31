import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api/api";

interface HeroProps {
  // ✅ Callback para abrir AuthModal en paso de código cuando el usuario ya existe
  onOpenAuthWithCode: (email: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuthWithCode }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim()) {
      // Sin email: ir a signup sin email precargado
      navigate("/advisor-signup");
      return;
    }

    if (!email.includes("@")) {
      // Email inválido: ir a signup con el texto como prefill
      navigate(`/advisor-signup?email=${encodeURIComponent(email)}`);
      return;
    }

    setLoading(true);

    try {
      // ✅ Verificar si el usuario existe enviando el código
      const response = await publicApi("/auth/check-email", {
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
    <section id="top" className="relative w-full">
      <div className="pt-28 pb-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left column */}
            <div>
              <p className="text-sm font-medium text-muted-foreground tracking-wide mb-4">
                Trusted quality via the Villa Net Rank™ scoring framework.
              </p>

              <h1 className="text-foreground text-5xl md:text-6xl font-semibold leading-[1.1] mb-6">
                Vetted luxury villas. Faster bookings.
              </h1>

              <h2 className="text-muted-foreground font-semibold text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                The all-in-one platform for travel advisors to source exclusive
                inventory and deliver professional white-label proposals in
                minutes.
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 mb-4 max-w-md">
                <input
                  type="email"
                  className="flex w-full rounded-md border bg-background py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm h-14 text-base px-5 border-input"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md h-14 uppercase tracking-wider text-sm px-8 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] transition-transform bg-[#111111] text-white hover:bg-[#333333] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Checking..." : "Get Instant Access"}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                No subscription fees. 100% protected commissions.
              </p>
            </div>

            {/* Right column: preview image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[560px]">
                <img
                  src="/assets/images/hero-search-preview.webp"
                  alt="Villa Net search results preview"
                  className="w-full h-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const fb = el.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "block";
                  }}
                />
                {/* Skeleton visible solo si imagen falla */}
                <div
                  className="w-full rounded-xl bg-muted border border-border p-6 space-y-3"
                  style={{ display: "none" }}
                >
                  <div className="h-3 bg-border rounded w-2/3" />
                  <div className="h-3 bg-border rounded w-2/5 mb-5" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-[4/3] bg-border/50 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};