import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="border-t border-border py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Logo y copyright */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
                <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
                <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5" />
                <path
                  d="M10.5 9.5L14 17L17.5 9.5"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#111111] font-bold text-xl tracking-[0.02em] leading-[1.0]">
                villanet
              </span>
            </div>
            <p className="text-sm text-[#6B7280]">
              © {currentYear} Villa Net. All rights reserved.
            </p>
          </div>

          {/* Enlaces en dos filas */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-7 text-sm text-[#6B7280]">
              <a href="/about" className="hover:text-foreground transition-colors">
                Villa Net Principles
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Villa Net Rank™ Framework
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Partner Admission Standards
              </a>
            </div>
            <div className="flex gap-7 text-sm text-[#6B7280]">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};