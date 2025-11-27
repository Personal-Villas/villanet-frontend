import React from 'react';
import { PropertyManagerSignupStepProps } from '../../types/propertyManager';

export const PropertyManagerSignupForm: React.FC<PropertyManagerSignupStepProps> = ({
  data,
  updateData,
  onSubmit,
  isSubmitting = false
}) => {
  const handleChange = (field: keyof typeof data.companyInfo, value: string) => {
    updateData({
      companyInfo: {
        ...data.companyInfo,
        [field]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (data.companyInfo.companyName && 
        data.companyInfo.contactName && 
        data.companyInfo.email && 
        data.companyInfo.locations) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Property Management Company Name
        </label>
        <input 
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
          placeholder="Your company name"
          required
          value={data.companyInfo.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Your Name
        </label>
        <input 
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
          placeholder="Your full name"
          required
          value={data.companyInfo.contactName}
          onChange={(e) => handleChange('contactName', e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Email
        </label>
        <input 
          type="email"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
          placeholder="you@example.com"
          required
          value={data.companyInfo.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Website <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input 
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
          placeholder="https://yourcompany.com"
          value={data.companyInfo.website}
          onChange={(e) => handleChange('website', e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Location(s) you manage
        </label>
        <input 
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
          placeholder="e.g., Cabo, St. Barts, Jamaica"
          required
          value={data.companyInfo.locations}
          onChange={(e) => handleChange('locations', e.target.value)}
        />
      </div>

      <p className="text-sm text-muted-foreground mt-6 mb-8">
        We review every property manager personally. Once onboarded, your villas become available to our network of vetted advisors.
      </p>

      <button 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 px-4 py-2 w-full h-14 text-base font-medium rounded-md shadow-none"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit & Schedule Intro Call'}
      </button>

      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Villa Net respects confidentiality. We never share unpublished property details publicly, and all inventory controls remain in your hands.
        </p>
      </div>
    </form>
  );
};