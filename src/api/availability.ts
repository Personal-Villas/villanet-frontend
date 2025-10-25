export type AvailItem = {
    listing_id: string;
    name?: string;
    lat?: number;
    lng?: number;
    hero_image_url?: string | null;
    price_usd?: number | null;
    available: boolean | null; // true/false/null (error o desconocido)
    nightlyFrom: number | null; // precio mínimo en el rango (si viene)
  };
  
  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  export async function fetchAvailability(params: {
    checkIn: string;   // YYYY-MM-DD
    checkOut: string;  // YYYY-MM-DD
    bbox?: { n: number; s: number; e: number; w: number };
    city?: string;
  }): Promise<AvailItem[]> {
    const qs = new URLSearchParams({
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      ...(params.city ? { city: params.city } : {}), // ← Sin String(), ya es string
      ...(params.bbox
        ? { bbox: `${params.bbox.n},${params.bbox.w},${params.bbox.s},${params.bbox.e}` }
        : {})
    });
    
    const res = await fetch(`${API}/availability?${qs.toString()}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || 'availability_failed');
    }
    
    const data = await res.json();
    return data.items as AvailItem[];
  }