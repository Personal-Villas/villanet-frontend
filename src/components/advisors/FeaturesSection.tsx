import React from "react";

export const FeaturesSection: React.FC = () => {
  return (
    <>
      <div className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl" />
      
      <section className="py-20 md:py-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Designed for Advisors
          </h2>
          <p className="text-base md:text-lg leading-[1.7] text-muted-foreground mb-10">
            Villa Net gives travel advisors the confidence and transparency they deserve — plus real-time data and support that makes every booking seamless.
          </p>
          <div className="flex justify-center">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none">
              Request Access →
            </button>
          </div>
        </div>
      </section>
    </>
  );
};