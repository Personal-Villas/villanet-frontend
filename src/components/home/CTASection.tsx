import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api/api";

interface CTASectionProps {
  onOpenAuthWithCode: (email: string) => void;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenAuthWithCode }) => {
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
    <section id="cta" className="py-24 px-6 bg-foreground">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-background mb-6">
          Stop sourcing. Start closing.
        </h2>
        <p className="text-base text-background/60 mb-10 max-w-xl mx-auto">
          Join a global network built on transparency, operational excellence,
          and trusted relationships.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-2">
          {/* AC 3: borde rojo + mensaje de error bajo el input */}
          <div className="flex-1 flex flex-col gap-1">
            <input
              type="text"
              className={`h-14 px-5 rounded-xl bg-background text-foreground border-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 transition-colors ${
                emailError
                  ? "border-red-500"
                  : "border-transparent focus-visible:border-ring"
              }`}
              placeholder="Enter your work email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
              disabled={loading}
            />
            {emailError && (
              <p className="text-red-400 text-xs pl-1 text-left">{emailError}</p>
            )}
          </div>

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