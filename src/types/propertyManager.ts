export interface PropertyManagerSignupData {
    companyInfo: {
      companyName: string;
      contactName: string;
      email: string;
      website?: string;
      locations: string;
    };
  }
  
  export interface PropertyManagerSignupStepProps {
    data: PropertyManagerSignupData;
    updateData: (updates: Partial<PropertyManagerSignupData>) => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
  }