import { useLoadScript } from '@react-google-maps/api';
import { createContext, useContext, ReactNode } from 'react';

type GoogleMapsProviderProps = {
  children: ReactNode;
};

type GoogleMapsContextValue = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: undefined,
});

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
  });

  if (loadError) {
    console.error('❌ Error loading Google Maps:', loadError);
  }

  // Always render children — Maps loads in parallel (no blank screen on "/" / "/home").
  // Map consumers must check useGoogleMaps() before rendering <GoogleMap>.
  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
