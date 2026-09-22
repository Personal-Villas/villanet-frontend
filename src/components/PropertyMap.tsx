import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../providers/GoogleMapsProvider';

type Props = {
  lat: number;
  lng: number;
  name?: string;
};

const containerStyle = { width: '100%', height: '100%' };

export default function PropertyMap({ lat, lng, name }: Props) {
  const center = { lat, lng };
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 px-4">
          <p>Error loading maps. Please check your API key.</p>
          <p className="text-sm mt-2">Check console for details</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={17}
      options={{
        mapTypeId: 'hybrid', 
        tilt: 0,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        clickableIcons: false,
        gestureHandling: 'cooperative',
        zoomControl: true,
      }}
    >
      <Marker position={center} title={name || 'Property location'} />
    </GoogleMap>
  );
}
