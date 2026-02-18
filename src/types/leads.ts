// types/leads.ts
// Tipos para expansion leads en el frontend

export interface ExpansionLeadRequest {
  // Información de contacto
  fullName: string;
  email: string;
  
  // Preferencias de búsqueda
  location: string;
  checkIn: string;
  checkOut: string;
  bedrooms: string[];
  bathrooms: string[];
  minPrice: string;
  maxPrice: string;
  guests: number;
  amenities: string[];
  currentResultsCount: number;
  searchContext: {
    query: string;
    selectedDestination: string;
    sortBy: string;
  };
}

export interface ExpansionLeadResponse {
  success: boolean;
  message: string;
  leadId: number;
  createdAt: string;
}

export type LeadStatus = 'pending' | 'contacted' | 'converted' | 'expired';

export interface ExpansionLead {
  id: number;
  userId?: number;
  userEmail?: string;
  fullName?: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  bedrooms?: string;
  bathrooms?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  amenities?: string;
  currentResultsCount?: number;
  searchContext?: string;
  status: LeadStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
}