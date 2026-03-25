export interface AdvisorPersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  export interface AdvisorProfessionalInfo {
    advisorType?: string;
    travelRegions?: string[];
    groupSize?: string;
    villaBudget?: string;
    commissionPreference?: string;
    website?: string;
    agreesToTerms?: boolean;
  }
  
  export interface AdvisorSignupData {
    personalInfo: AdvisorPersonalInfo;
    professionalInfo?: AdvisorProfessionalInfo;
    agencyLogo?: File | null;
  }
  
  export interface AdvisorSignupStepProps {
    data: AdvisorSignupData;
    updateData: (updates: Partial<AdvisorSignupData>) => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
  }