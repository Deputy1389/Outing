
import { Venue } from '../types';
import { venues } from '../data/venues';

// Use standard LA coordinates if none provided
export const DEFAULT_LAT = 34.091; 
export const DEFAULT_LNG = -118.281;

export const getAllVenues = (): Venue[] => {
  return (venues as any[]).map(v => ({
    ...v,
    // Add default images/urls if missing in JSON
    imageUrl: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400`,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`
  }));
};

export const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
