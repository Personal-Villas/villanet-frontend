import React from "react";

export const PartnershipSection: React.FC = () => {
  return (
    <>
      <section className="py-16 md:py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
            A Partnership Built on Reputation
          </h2>
          <p className="text-base md:text-lg leading-[1.7] text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
            Villa Net isn't just another listing site — it's a trusted ecosystem. We selectively onboard managers who demonstrate exceptional standards in guest services, financial transparency, and operational reliability. Our verification process ensures that every partner upholds the values that luxury travelers expect — and deserve.
          </p>
          <p className="text-base text-muted-foreground mb-8 text-center">
            Ready to join the network that's redefining trust in luxury villa rentals?
          </p>
          <div className="flex justify-center">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none">
              Start Your Application →
            </button>
          </div>
        </div>
      </section>
      
      <div className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl" />
    </>
  );
};