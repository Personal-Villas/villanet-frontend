import { GoogleMap, Marker } from '@react-google-maps/api';

type Props = {
  lat: number;
  lng: number;
  name?: string;
};

const containerStyle = { width: '100%', height: '100%' };

export default function PropertyMap({ lat, lng, name }: Props) {
  const center = { lat, lng };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={17}
      options={{
        mapTypeId: 'satellite',
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
