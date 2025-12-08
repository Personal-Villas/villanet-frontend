import React from "react";
import robertCracknell from "../../assets/images/robert-history.jpg";
import jhonyBlanco from "../../assets/images/jhony-history.jpg";

export const FoundersSection: React.FC = () => {
  const founders = [
    {
      name: "Robert Cracknell",
      role: "Founder & CEO",
      description: "Luxury-villa veteran and founder of Personal Villas, Robert has spent over a decade building trust networks across the world's top destinations.",
      image: robertCracknell,
      alt: "Robert Cracknell, Founder & CEO"
    },
    {
      name: "Jhony Blanco",
      role: "Co-Founder & CTO",
      description: "A systems engineer passionate about hospitality data, Jhony leads the architecture behind Villa Net's proprietary ranking and verification systems.",
      image: jhonyBlanco,
      alt: "Jhony Blanco, Co-Founder & CTO"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gray-100">
      <div className="container mx-auto max-w-4xl">
        <p className="text-sm font-medium tracking-[0.1em] uppercase text-muted-foreground mb-12 text-center">
          FOUNDERS
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {founders.map((founder, index) => (
            <FounderCard key={index} {...founder} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FounderCardProps {
  name: string;
  role: string;
  description: string;
  image: string | null;
  alt: string;
}

const FounderCard: React.FC<FounderCardProps> = ({ name, role, description, image, alt }) => {
  return (
    <div className="border border-[#E5E5E5] rounded-lg bg-background overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="aspect-square bg-gray-200 overflow-hidden grayscale">
        {image ? (
          <img src={image} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-gray-400">J</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">{role}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};