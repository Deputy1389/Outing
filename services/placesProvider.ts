
import { Venue } from '../types';

export interface SearchParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
}

// Data retrieval layer using local proxy server (/api)
export const PlacesProvider = {
  async geocode(query: string): Promise<{ lat: number; lng: number; address: string }> {
    const url = `/api/geocode?query=${encodeURIComponent(query)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error("Could not resolve location. Please ensure the proxy server is running and your API key is configured.");
    }
    const data = await resp.json();
    return data;
  },

  async searchVenues(params: SearchParams): Promise<Venue[]> {
    const resp = await fetch('/api/venues/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!resp.ok) {
      throw new Error("Venue search failed. Check your server connection.");
    }

    const data = await resp.json();
    // Normalization is already mostly handled on server, but ensuring full type compliance
    return (data || []).map((v: any) => ({
      ...v,
      // Ensure specific fields if server didn't provide them
      priceLevel: v.priceLevel || 2,
      reviewCount: v.reviewCount || 100,
      tags: v.tags || v.categories || [],
      alcoholType: v.alcoholType || (v.categories || []).some((c: string) => c.toLowerCase().includes('bar')) ? 'bar' : 'optional',
      dietarySupport: v.dietarySupport || [],
      hours: v.hours || { openMorning: true, openEvening: true, openLate: true },
      imageUrl: v.imageUrl || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400`,
      mapsUrl: v.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name)}`
    }));
  },

  async getWeather(lat: number, lng: number, date: string): Promise<{ temp: number; condition: string; precip_prob: number }> {
    const url = `/api/weather?lat=${lat}&lng=${lng}&date=${date}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return { temp: 72, condition: 'Fair', precip_prob: 0 };
    }
    return await resp.json();
  }
};
