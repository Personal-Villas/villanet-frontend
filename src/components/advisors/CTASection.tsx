import React from "react";

export const CTASection: React.FC = () => {
  return (
    <>
      <div className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl" />
      
      <section className="py-16 px-6 bg-[#FAFAFA] dark:bg-accent/10">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            Already part of the network?
          </p>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:text-accent-foreground h-10 text-base py-[14px] px-9 rounded-md shadow-none border-[#111111] hover:bg-gray-50">
            Log in to Advisor Portal →
          </button>
        </div>
      </section>
    </>
  );
};