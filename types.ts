
export enum Vibe {
  COZY = 'cozy',
  LIVELY = 'lively',
  CLASSY = 'classy',
  ADVENTUROUS = 'adventurous',
  ARTSY = 'artsy',
  LOW_KEY = 'low-key'
}

export enum BudgetLevel {
  CHEAP = 1,
  MODERATE = 2,
  EXPENSIVE = 3,
  LUXURY = 4
}

export enum AlcoholPref {
  PREFERRED = 'preferred',
  NEUTRAL = 'neutral',
  NONE = 'none'
}

export enum LocationMode {
  MINE = 'mine',
  THEIRS = 'theirs',
  MIDPOINT = 'midpoint',
  CUSTOM = 'custom'
}

export interface Venue {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  price_level: number;
  address: string;
  short_description: string;
  categories: string[];
  imageUrl: string;
  mapsUrl: string;
  open_time: string; // HH:MM
  close_time: string; // HH:MM
}

export interface ItinerarySlot {
  slot_index: number; 
  venue: Venue;
  status: 'kept' | 'swapped' | 'blocked' | 'final';
  start_time: string;
  end_time: string;
}

export interface Outing {
  id: string;
  created_at: string;
  date: string; // YYYY-MM-DD
  location_mode: LocationMode;
  vibe: Vibe;
  budget_level: BudgetLevel;
  dietary_tags: string[];
  alcohol_pref: AlcoholPref;
  start_datetime: string; // This is actually HH:MM start
  end_datetime?: string; // This is actually HH:MM end
  slots: ItinerarySlot[];
  weather_snapshot?: {
    temp: number;
    condition: string;
    precip_prob: number;
  };
}

export type AppView = 'onboarding' | 'create' | 'itinerary' | 'final' | 'history' | 'membership';
