
import { Outing, Venue, ItinerarySlot, Vibe, AlcoholPref, DietaryTag } from '../types';
import { getAllVenues, getHaversineDistance, DEFAULT_LAT, DEFAULT_LNG } from './mockPlaces';
import { getMockWeather } from './mockWeather';

interface PlannerParams {
  date: string;
  vibe: Vibe;
  budget: number;
  alcoholPref: AlcoholPref;
  dietaryTags: DietaryTag[];
  range: number;
  startTime: string;
  lat?: number;
  lng?: number;
  blockedIds?: string[];
}

const CATEGORIES_BY_SLOT = {
  1: ['cafe', 'tea', 'juice', 'wine bar', 'cocktail bar'],
  2: ['restaurant', 'museum', 'gallery', 'comedy', 'music', 'arcade', 'bowling'],
  3: ['dessert', 'wine bar', 'cocktail bar', 'juice']
};

export const planOuting = (params: PlannerParams): { weather: any, slots: ItinerarySlot[] } => {
  const allVenues = getAllVenues();
  const weather = getMockWeather(params.date);
  const centerLat = params.lat || DEFAULT_LAT;
  const centerLng = params.lng || DEFAULT_LNG;
  
  const blocked = new Set(params.blockedIds || []);

  const scoreVenue = (venue: Venue, slotIdx: number, prevLat?: number, prevLng?: number): number => {
    if (blocked.has(venue.id)) return -1000;

    let score = 0;
    
    // 1. Basic Eligibility (Category)
    const validCats = (CATEGORIES_BY_SLOT as any)[slotIdx];
    if (!venue.categories.some(c => validCats.includes(c))) return -500;

    // 2. Alcohol Preference
    if (params.alcoholPref === AlcoholPref.NONE && venue.alcoholType === 'bar') return -500;
    if (params.alcoholPref === AlcoholPref.PREFERRED && venue.alcoholType === 'bar') score += 30;

    // 3. Dietary Support
    const missingDiet = params.dietaryTags.filter(tag => !venue.dietarySupport.includes(tag));
    score -= (missingDiet.length * 60);

    // 4. Budget Match (Strong weighting)
    const budgetDiff = Math.abs(venue.priceLevel - params.budget);
    score -= (budgetDiff * 50);

    // 5. Distance (Strong weighting)
    const distFromCenter = getHaversineDistance(centerLat, centerLng, venue.lat, venue.lng);
    if (distFromCenter > params.range) return -200;
    score += (params.range - distFromCenter) * 10; 

    if (prevLat && prevLng) {
      const stepDist = getHaversineDistance(prevLat, prevLng, venue.lat, venue.lng);
      score -= (stepDist * 30); // Heavy penalty for large jumps between stops
    }

    // 6. Quality
    score += (venue.rating * 15);
    score += (Math.log10(venue.reviewCount || 1) * 5);

    // 7. Weather
    if (weather.precip_prob > 40 && venue.tags.includes('outdoor-seating') && !venue.tags.includes('indoor')) {
      score -= 100;
    }

    return score;
  };

  const selectedVenues: Venue[] = [];
  const slots: ItinerarySlot[] = [];
  
  // Greedy slot selection
  for (let i = 1; i <= 3; i++) {
    const prev = selectedVenues[i-2];
    const scored = allVenues
      .filter(v => !selectedVenues.some(sv => sv.id === v.id))
      .map(v => ({ venue: v, score: scoreVenue(v, i, prev?.lat, prev?.lng) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0].venue;
    selectedVenues.push(best);

    // Simple time logic
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

  return { weather, slots };
};

export const swapSlotDeterministic = (outing: Outing, slotIdx: number, blockedIds: string[]): Venue => {
  const allVenues = getAllVenues();
  const prev = slotIdx > 1 ? outing.slots[slotIdx - 2].venue : undefined;
  
  const currentId = outing.slots[slotIdx - 1].venue.id;
  const allBlocked = [...blockedIds, currentId, ...outing.slots.map(s => s.venue.id)];
  
  const scored = allVenues
    .filter(v => !allBlocked.includes(v.id))
    .map(v => {
      let score = 0;
      const validCats = (CATEGORIES_BY_SLOT as any)[slotIdx];
      if (!v.categories.some(c => validCats.includes(c))) return { venue: v, score: -1000 };
      
      const distFromCenter = getHaversineDistance(DEFAULT_LAT, DEFAULT_LNG, v.lat, v.lng);
      score += (outing.range_miles - distFromCenter) * 10;

      if (prev) {
        const stepDist = getHaversineDistance(prev.lat, prev.lng, v.lat, v.lng);
        score -= (stepDist * 30);
      }

      score += v.rating * 15;
      return { venue: v, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0].venue;
};
