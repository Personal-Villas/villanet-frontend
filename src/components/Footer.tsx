import React from "react";

const Logo = () => (
  <div className="flex items-center gap-3">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
      <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
      <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5" />
      <path d="M10.5 9.5L14 17L17.5 9.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="text-[#111111] font-bold text-xl tracking-[0.02em] leading-[1]">villanet</span>
  </div>
);

const Footer: React.FC = () => {
  return (
    <footer id="about" className="border-t border-border py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-[#6B7280]">© 2025 Villa Net. All rights reserved.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-7 text-sm text-[#6B7280]">
              <a href="/trust-framework#principles" className="hover:text-foreground transition-colors">
                Villa Net Principles
              </a>
              <a href="/trust-framework#rank-framework" className="hover:text-foreground transition-colors">
                Villa Net Rank™ Framework
              </a>
              <a href="/trust-framework#admission-standards" className="hover:text-foreground transition-colors">
                Partner Admission Standards
              </a>
            </div>
            <div className="flex flex-wrap gap-7 text-sm text-[#6B7280]">
              <a href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/trust-framework#contact" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;