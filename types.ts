
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

export enum DietaryTag {
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  GLUTEN_FREE = 'gluten-free',
  DAIRY_FREE = 'dairy-free',
  HALAL = 'halal',
  KOSHER = 'kosher'
}

export interface Venue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  neighborhood?: string;
  categories: string[];
  priceLevel: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  alcoholType: 'none' | 'optional' | 'bar';
  dietarySupport: string[];
  hours: {
    openMorning: boolean;
    openEvening: boolean;
    openLate: boolean;
  };
  imageUrl?: string;
  mapsUrl?: string;
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
  center_lat?: number;
  center_lng?: number;
  vibe: Vibe;
  budget_level: BudgetLevel;
  dietary_tags: DietaryTag[];
  alcohol_pref: AlcoholPref;
  range_miles: number;
  indoor_outdoor: 'indoor' | 'outdoor' | 'either';
  start_time: string;
  end_time?: string;
  slots: ItinerarySlot[];
  weather_snapshot?: {
    temp: number;
    condition: string;
    precip_prob: number;
  };
}

export type AppView = 'onboarding' | 'create' | 'itinerary' | 'final' | 'history' | 'membership';
