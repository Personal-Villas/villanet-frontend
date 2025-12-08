import React from "react";
import { Mail } from "lucide-react";

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 md:py-28 px-6 bg-[#FAFAFA] scroll-mt-36">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="inline-flex p-3 bg-background rounded-full border border-border mb-6">
          <Mail className="w-6 h-6 text-foreground" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Let's Connect
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Ready to join the Villa Net network? Choose your path below.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/advisor-signup" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#000000] text-[#FFFFFF] hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none"
          >
            Join the Advisor Network →
          </a>
          <a 
            href="/property-manager-signup" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-10 text-base py-[14px] px-9 rounded-md shadow-none border-foreground hover:bg-accent"
          >
            Apply as Verified PM →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;