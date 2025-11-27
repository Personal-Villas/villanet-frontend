import { AdvisorSignupData } from '../types/advisor';

// 🆕 Importar o definir la interfaz AuthResponse
interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'ta' | 'pmc';
    status: 'pending' | 'approved' | 'rejected';
    full_name: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const advisorService = {
  // 🆕 Cambiar el tipo de retorno a AuthResponse
  async submitAdvisorSignup(data: AdvisorSignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/advisors/signup`, {
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

      const result = await response.json();
      
      // 🆕 Devolver en formato AuthResponse
      return {
        accessToken: result.accessToken,
        user: result.user
      };
      
    } catch (error) {
      console.error('Error submitting advisor signup:', error);
      throw error; // 🆕 Propagar el error en lugar de retornar objeto de error
    }
  },

  // Preparar datos para el backend
  prepareDataForBackend(data: AdvisorSignupData) {
    return {
      // Información personal
      first_name: data.personalInfo.firstName,
      last_name: data.personalInfo.lastName,
      email: data.personalInfo.email,
      password: data.personalInfo.password,

      // Información profesional (opcional)
      advisor_type: data.professionalInfo?.advisorType,
      travel_regions: data.professionalInfo?.travelRegions,
      typical_group_size: data.professionalInfo?.groupSize,
      villa_budget_range: data.professionalInfo?.villaBudget,
      commission_preference: data.professionalInfo?.commissionPreference,
      website: data.professionalInfo?.website,
      agreed_to_terms: data.professionalInfo?.agreesToTerms,
      
      // Metadata
      profile_completion_percentage: this.calculateCompletionPercentage(data),
    };
  },

  // Calcular porcentaje de completitud
  calculateCompletionPercentage(data: AdvisorSignupData): number {
    let percentage = 20; // Base por completar paso 1

    if (data.professionalInfo) {
      const professionalFields = [
        data.professionalInfo.advisorType,
        data.professionalInfo.travelRegions && data.professionalInfo.travelRegions.length > 0,
        data.professionalInfo.groupSize,
        data.professionalInfo.villaBudget,
        data.professionalInfo.commissionPreference,
        data.professionalInfo.website,
        data.professionalInfo.agreesToTerms,
      ];

      const completedFields = professionalFields.filter(Boolean).length;
      percentage += Math.round((completedFields / professionalFields.length) * 80);
    }

    return Math.min(percentage, 100);
  },
};