import { useLoadScript } from '@react-google-maps/api';
import { ReactNode } from 'react';

type GoogleMapsProviderProps = {
  children: ReactNode;
};

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  // 🔍 DEBUG: Verifica que la API key se esté leyendo
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey?.length || 0);
  console.log('🔑 First 10 chars:', apiKey?.substring(0, 10));
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
  });

  if (loadError) {
    console.error('❌ Error loading Google Maps:', loadError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading maps. Please check your API key.</p>
          <p className="text-sm mt-2">Check console for details</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading maps...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}