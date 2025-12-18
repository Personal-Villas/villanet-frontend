export interface EarlyAccessRequest {
    name: string;
    email: string;
    linkedin?: string;
    agency?: string;
  }
  
  export interface EarlyAccessResponse {
    message: string;
    request: {
      id: number;
      name: string;
      email: string;
      linkedin_url: string | null;
      agency: string | null;
      status: string;
      created_at: string;
    };
  }
  
  /**
   * Submit Early Access request to backend
   */
  export async function submitEarlyAccessRequest(
    data: EarlyAccessRequest
  ): Promise<EarlyAccessResponse> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    const res = await fetch(`${API_URL}/early-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    // Intentar parsear la respuesta como JSON
    let responseData;
    try {
      responseData = await res.json();
    } catch (e) {
      responseData = { message: 'Server error', error: 'Failed to parse response' };
    }
  
    if (!res.ok) {
      // Crear mensaje de error específico según el status code
      let errorMessage = '';
      
      if (res.status === 409) {
        errorMessage = responseData.message || 'A request with this email already exists';
      } else if (res.status === 400) {
        errorMessage = responseData.message || 'Invalid input. Please check your information.';
      } else {
        errorMessage = responseData.message || responseData.error || 'Failed to submit request. Please try again.';
      }
      
      // Lanzar error con el mensaje correcto
      const error = new Error(errorMessage);
      // Añadir el status code como propiedad para debugging
      (error as any).statusCode = res.status;
      throw error;
    }
  
    return responseData;
  }