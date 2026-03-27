import React from 'react';
import { AdvisorSignupData } from '../../types/advisor';

interface AdvisorSignupStep1Props {
  data: AdvisorSignupData;
  updateData: (updates: Partial<AdvisorSignupData>) => void;
  onComplete: () => void;
}

export const AdvisorSignupStep1: React.FC<AdvisorSignupStep1Props> = ({
  data,
  updateData,
  onComplete
}) => {
  const handleChange = (field: keyof typeof data.personalInfo, value: string) => {
    updateData({
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica
    if (data.personalInfo.firstName && 
        data.personalInfo.lastName && 
        data.personalInfo.email && 
        data.personalInfo.password) {
      onComplete(); // Esto va a la pantalla de bienvenida
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 -mt-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            First Name
          </label>
          <input 
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
            placeholder="First name"
            required
            value={data.personalInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Last Name
          </label>
          <input 
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
            placeholder="Last name"
            required
            value={data.personalInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>
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
          value={data.personalInfo.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Create Password
        </label>
        <input 
          type="password"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
          placeholder="••••••••"
          required
          minLength={8}
          value={data.personalInfo.password}
          onChange={(e) => handleChange('password', e.target.value)}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Minimum 8 characters.
        </p>
      </div>
      
      <button 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 px-4 py-2 w-full h-14 text-base font-medium rounded-md shadow-none mt-8"
        type="submit"
      >
        Create Your Advisor Account
      </button>
    </form>
  );
};