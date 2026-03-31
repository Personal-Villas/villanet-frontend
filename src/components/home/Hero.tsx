import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api/api";

interface HeroProps {
  onOpenAuthWithCode: (email: string) => void;
}

// Validación más estricta que solo incluir '@'
// Rechaza: "usuario@com", "a@b", "@dominio.com", etc.
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuthWithCode }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(null);
  };

  const handleSubmit = async () => {
    // AC 1: campo vacío
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    // AC 2: formato inválido
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    setLoading(true);

    try {
      const response = await publicApi("/auth/send-code", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      }) as { userExists: boolean };

      if (response.userExists) {
        onOpenAuthWithCode(email.trim());
      } else {
        navigate(`/advisor-signup?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err) {
      console.error("❌ Error checking user:", err);
      navigate(`/advisor-signup?email=${encodeURIComponent(email.trim())}`);
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

              <div className="flex flex-col sm:flex-row gap-3 mb-2 max-w-md">
                {/* AC 3: borde rojo + mensaje de error bajo el input */}
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    className={`flex w-full rounded-md bg-background py-2 placeholder:text-muted-foreground focus-visible:outline-none md:text-sm h-14 text-base px-5 transition-all border-2 ${
                      emailError
                        ? "border-red-500 focus-visible:ring-0"
                        : "border-input focus-visible:border-ring"
                    }`}
                    placeholder="Enter your work email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                    disabled={loading}
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs pl-1">{emailError}</p>
                  )}
                </div>
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