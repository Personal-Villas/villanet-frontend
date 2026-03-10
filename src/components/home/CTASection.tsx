import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const CTASection: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (email) {
      navigate(`/advisor-signup?email=${encodeURIComponent(email)}`);
    } else {
      navigate("/advisor-signup");
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
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            className="h-14 px-8 rounded-xl bg-background text-foreground font-medium uppercase tracking-wider text-sm whitespace-nowrap hover:bg-background/90 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Get Instant Access
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