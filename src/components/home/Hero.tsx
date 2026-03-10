import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Hero: React.FC = () => {
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
    <section id="top" className="relative w-full">
      {/* Estructura idéntica al HTML de Lovable */}
      <div className="pt-28 pb-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left column */}
            <div>
              {/* Eyebrow: sin font-medium extra, igual que Lovable */}
              <p className="text-sm font-medium text-muted-foreground tracking-wide mb-4">
                Trusted quality via the Villa Net Rank™ scoring framework.
              </p>

              {/*
                H1: text-5xl md:text-6xl font-semibold — copiado literal de Lovable.
                No clamp, no font-bold. leading-[1.1] como en Lovable.
              */}
              <h1 className="text-foreground text-5xl md:text-6xl font-semibold leading-[1.1] mb-6">
                Vetted luxury villas. Faster bookings.
              </h1>

              {/*
                Subtítulo: text-muted-foreground, SIN font-semibold — igual que Lovable.
                El HTML de Lovable usa h2 con estas clases exactas.
                En tu proyecto con Helvetica Now la diferencia de peso es menor.
              */}
              <h2 className="text-muted-foreground font-semibold text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                The all-in-one platform for travel advisors to source exclusive
                inventory and deliver professional white-label proposals in
                minutes.
              </h2>

              {/*
                CTA: estructura idéntica a Lovable.
                Botón: bg-[#111111] en lugar de bg-primary para forzar negro.
              */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 max-w-md">
                <input
                  type="email"
                  className="flex w-full rounded-md border bg-background py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm h-14 !rounded-xl text-base px-5 border-input"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md h-14 !rounded-xl uppercase tracking-wider text-sm px-8 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] transition-transform bg-[#111111] text-white hover:bg-[#333333]"
                >
                  Get Instant Access
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
                  src="src/assets/images/hero-search-preview.png"
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