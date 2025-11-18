import React from "react";
import bestonProperties from "../../assets/images/beston.png";
import blueSkyLuxury from "../../assets/images/blue-sky.png";
import tryallClub from "../../assets/images/tryall.png";
import mitaResidential from "../../assets/images/mr.png";

export const ProofSection: React.FC = () => {
  const partners = [
    {
      name: "Beston Properties",
      image: bestonProperties
    },
    {
      name: "Blue Sky Luxury",
      image: blueSkyLuxury
    },
    {
      name: "The Tryall Club",
      image: tryallClub
    },
    {
      name: "Mita Residential",
      image: mitaResidential
    }
  ];

  const testimonials = [
    {
      quote: "\"Villa Net brings us aligned, qualified inquiries. It makes every conversation faster.\"",
      author: "— Villa Specialist, Caribbean"
    },
    {
      quote: "\"Finally, a platform that understands the operational side of villa management.\"",
      author: "— Managing Director, Mexico Portfolio"
    }
  ];

  return (
    <section id="proof" className="py-[120px] px-6">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl text-center mb-6">
          Trusted by leading villa professionals worldwide.
        </h2>
        <p className="text-center text-[#6B7280] text-base mx-auto max-w-[720px] mb-16">
          Our network includes top-tier villa specialists and proven property management firms across the Caribbean, Mexico, Europe, and beyond.
        </p>
        
        <p className="text-center text-sm font-medium text-[#6B7280] mb-6">
          Selected Partners:
        </p>
        
        <div className="flex justify-center items-center gap-8 mb-20 flex-wrap">
          {partners.map((partner) => (
            <div 
              key={partner.name}
              className="w-[140px] h-[56px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img 
                src={partner.image} 
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, index) => (
            <blockquote 
              key={index}
              className="border-l-2 border-[#D1D5DB] py-8 px-6"
            >
              <p className="text-lg text-[#111111] mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <footer className="text-sm text-[#6B7280]">
                {testimonial.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};