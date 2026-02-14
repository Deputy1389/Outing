
import { Outing, Venue, ItinerarySlot, Vibe, AlcoholPref, DietaryTag } from '../types';
import { getHaversineDistance } from './mockPlaces';
import { PlacesProvider } from './placesProvider';

interface PlannerParams {
  centerLat: number;
  centerLng: number;
  date: string;
  vibe: Vibe;
  budget: number;
  alcoholPref: AlcoholPref;
  dietaryTags: DietaryTag[];
  rangeMiles: number;
  startTime: string;
  weather: any;
  blockedIds?: string[];
}

const CATEGORIES_BY_SLOT = {
  1: { google: ['cafe', 'bakery', 'coffee_shop', 'tea_house'], keywords: ['cafe', 'coffee', 'matcha'] },
  2: { google: ['restaurant', 'bar'], keywords: ['dinner', 'bistro', 'eatery'] },
  3: { google: ['dessert_shop', 'bar', 'movie_theater'], keywords: ['dessert', 'cocktails', 'wine bar', 'ice cream'] }
};

export const planOutingLive = async (params: PlannerParams): Promise<ItinerarySlot[]> => {
  const slots: ItinerarySlot[] = [];
  const selectedIds = new Set(params.blockedIds || []);
  const radiusMeters = Math.round(params.rangeMiles * 1609.34);

  let currentLat = params.centerLat;
  let currentLng = params.centerLng;

  for (let i = 1; i <= 3; i++) {
    const config = (CATEGORIES_BY_SLOT as any)[i];
    
    // Fetch real venues for this specific slot type via Proxy
    const pool = await PlacesProvider.searchVenues({
      lat: currentLat,
      lng: currentLng,
      radiusMeters,
      categories: config.google,
      maxPrice: params.budget,
      keyword: config.keywords.join(' ')
    });

    const scored = pool
      .filter(v => !selectedIds.has(v.id))
      .map(v => ({ venue: v, score: scoreVenue(v, i, params, currentLat, currentLng) }))
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      throw new Error(`No suitable venues found for Stop ${i} in this area. Try widening your range.`);
    }

    const best = scored[0].venue;
    selectedIds.add(best.id);

    // Update location for next slot search to maximize path efficiency
    currentLat = best.lat;
    currentLng = best.lng;

    const startH = parseInt(params.startTime.split(':')[0]);
    const startM = parseInt(params.startTime.split(':')[1]);
    const slotStart = `${(startH + (i-1)*1.5).toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
    const slotEnd = `${(startH + i*1.5).toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;

    slots.push({
      slot_index: i,
      venue: best,
      status: 'kept',
      start_time: slotStart,
      end_time: slotEnd
    });
  }

  return slots;
};

const scoreVenue = (venue: Venue, slotIdx: number, params: PlannerParams, prevLat: number, prevLng: number): number => {
  let score = 0;

  // 1. Alcohol Preference Filtering
  if (params.alcoholPref === AlcoholPref.NONE && venue.alcoholType === 'bar') score -= 1000;
  if (params.alcoholPref === AlcoholPref.PREFERRED && venue.alcoholType === 'bar') score += 100;

  // 2. Dietary Keyword Matching (Best effort)
  params.dietaryTags.forEach(tag => {
    const match = venue.name.toLowerCase().includes(tag) || 
                  venue.tags.some(t => t.toLowerCase().includes(tag));
    if (match) score += 50;
  });

  // 3. Proximity Scoring (Minimize commute between stops)
  const dist = getHaversineDistance(prevLat, prevLng, venue.lat, venue.lng);
  score -= (dist * 60); 

  // 4. Quality Signals
  score += (venue.rating * 30);
  score += (Math.log10(venue.reviewCount + 1) * 10);

  // 5. Weather Rules
  if (params.weather.precip_prob > 30 && venue.tags.includes('outdoor')) {
    score -= 300;
  }

  return score;
};

export const swapSlotDeterministic = async (outing: Outing, slotIdx: number, blockedIds: string[]): Promise<Venue> => {
  const config = (CATEGORIES_BY_SLOT as any)[slotIdx];
  const prev = slotIdx > 1 ? outing.slots[slotIdx - 2].venue : { lat: outing.center_lat, lng: outing.center_lng };
  
  const pool = await PlacesProvider.searchVenues({
    lat: prev.lat,
    lng: prev.lng,
    radiusMeters: Math.round(outing.range_miles * 1609.34),
    categories: config.google,
    maxPrice: outing.budget_level,
    keyword: config.keywords.join(' ')
  });

  const excluded = new Set([...blockedIds, ...outing.slots.map(s => s.venue.id)]);
  
  const scored = pool
    .filter(v => !excluded.has(v.id))
    .map(v => {
      let score = v.rating * 15;
      const dist = getHaversineDistance(prev.lat, prev.lng, v.lat, v.lng);
      score -= (dist * 40);
      return { venue: v, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) throw new Error("No alternatives found nearby.");
  return scored[0].venue;
};
