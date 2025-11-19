import React from "react";
import robertCracknell from "../../assets/images/robert-history.jpg";

export const StorySection: React.FC = () => {
  return (
    <>
      {/* Sección Our Story */}
      <section className="relative py-20 md:py-28 px-6 bg-[#FAFAFA] dark:bg-accent/20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-accent rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid md:grid-cols-[1fr_1fr] gap-12 md:gap-20 items-center relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent opacity-30" />
            
            <div>
              <div className="relative inline-block mb-8">
                <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
                  OUR STORY
                </p>
                <div className="absolute -bottom-1 left-0 w-8 h-[1px] bg-gradient-to-r from-accent to-transparent opacity-60" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-[1.1] opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                Born from a decade of trust-building in luxury hospitality.
              </h2>
              
              <div className="space-y-5 text-base md:text-lg leading-[1.7] text-muted-foreground max-w-[65ch]">
                <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                  Villa Net was founded by Robert Cracknell, a 12-year veteran in the luxury villa industry and founder of Personal Villas, together with Jhony Blanco, our CTO and systems architect.
                </p>
                <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                  After more than a decade working at the intersection of technology and hospitality, they saw the same pattern repeating: beautiful properties, but no universal way to measure trust.
                </p>
                <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                  So they asked a deceptively simple question:<br />
                  <span className="italic text-foreground">Who can we truly trust?</span>
                </p>
                <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                  That question became a mission — to build a platform where trust isn't promised, it's proven.
                </p>
                <p className="font-medium text-foreground opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
                  Villa Net is that platform — a verification layer redefining how the global luxury-rental industry measures excellence, transparency, and partnership.
                </p>
              </div>
            </div>
            
            <div className="order-first md:order-last md:pl-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden shadow-lg group relative">
                <img 
                  src={robertCracknell} 
                  alt="Robert Cracknell, Founder & CEO of Villa Net" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10 pointer-events-none opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};