import React from "react";

const NavSticky: React.FC = () => {
  return (
    <nav className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-y border-border py-4 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide">
          <a href="#principles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Villa Net Principles
          </a>
          <a href="#rank-framework" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Villa Net Rank™
          </a>
          <a href="#admission-standards" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Partner Standards
          </a>
          <a href="#terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Terms of Service
          </a>
          <a href="#privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Privacy Policy
          </a>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavSticky;