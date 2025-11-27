import { PropertyManagerSignupData } from '../types/propertyManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const propertyManagerService = {
  async submitSignup(data: PropertyManagerSignupData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/property-managers/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.prepareDataForBackend(data)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error submitting property manager signup:', error);
      throw error;
    }
  },

  prepareDataForBackend(data: PropertyManagerSignupData) {
    return {
      company_name: data.companyInfo.companyName,
      contact_name: data.companyInfo.contactName,
      email: data.companyInfo.email,
      website: data.companyInfo.website || null,
      locations: data.companyInfo.locations,
      submitted_at: new Date().toISOString(),
    };
  },
};