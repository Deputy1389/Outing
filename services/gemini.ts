
import { GoogleGenAI, Type } from "@google/genai";
import { Outing, Vibe, BudgetLevel, AlcoholPref, Venue, ItinerarySlot } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VENUE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    place_id: { type: Type.STRING },
    name: { type: Type.STRING },
    rating: { type: Type.NUMBER },
    user_ratings_total: { type: Type.NUMBER },
    price_level: { type: Type.NUMBER },
    address: { type: Type.STRING },
    short_description: { type: Type.STRING },
    categories: { type: Type.ARRAY, items: { type: Type.STRING } },
    imageUrl: { type: Type.STRING },
    mapsUrl: { type: Type.STRING },
    open_time: { type: Type.STRING, description: "Opening time in HH:MM format (24h)" },
    close_time: { type: Type.STRING, description: "Closing time in HH:MM format (24h). Use 23:59 for late night." },
  },
  required: ["place_id", "name", "rating", "user_ratings_total", "price_level", "address", "short_description", "categories", "imageUrl", "mapsUrl", "open_time", "close_time"],
};

const ITINERARY_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    weather: {
      type: Type.OBJECT,
      properties: {
        temp: { type: Type.NUMBER },
        condition: { type: Type.STRING },
        precip_prob: { type: Type.NUMBER },
      },
      required: ["temp", "condition", "precip_prob"],
    },
    slots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slot_index: { type: Type.NUMBER },
          start_time: { type: Type.STRING },
          end_time: { type: Type.STRING },
          venue: VENUE_SCHEMA,
        },
        required: ["slot_index", "start_time", "end_time", "venue"],
      },
    },
  },
  required: ["weather", "slots"],
};

export const generateOuting = async (params: Partial<Outing>): Promise<{ weather: any, slots: ItinerarySlot[] }> => {
  const prompt = `
    Act as a high-end date planning engine "Outing". 
    Create a 3-stop date itinerary based on these strict rules:
    
    INPUTS:
    - Date: ${params.date} (Day of week: ${params.date ? new Date(params.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown'})
    - Vibe: ${params.vibe}
    - Budget: ${params.budget_level} (scale 1-4)
    - Start Time: ${params.start_datetime}
    ${params.end_datetime ? `- Hard Cutoff End Time: ${params.end_datetime}` : ''}
    
    OUTPUT REQUIREMENTS:
    1. Suggest realistic start_time and end_time for each slot in HH:MM format.
    2. Provide REALISTIC opening_hours (open_time, close_time) for each venue SPECIFICALLY for the date ${params.date}.
    3. The first slot must start at ${params.start_datetime}.
    4. Each slot should typically last 1-2 hours depending on the activity.
    5. Index stops 1, 2, 3 in order.

    Generate 3 REALISTIC venues for a major metropolitan area. Ensure the operating hours provided match the suggested slot times.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: ITINERARY_RESPONSE_SCHEMA,
    },
  });

  const data = JSON.parse(response.text);
  const slots: ItinerarySlot[] = data.slots.map((s: any) => ({
    ...s,
    status: 'kept',
  }));

  return {
    weather: data.weather,
    slots: slots.sort((a, b) => a.slot_index - b.slot_index),
  };
};

export const generateAdditionalSlot = async (outing: Outing, newSlotIndex: number): Promise<ItinerarySlot> => {
  const lastSlot = outing.slots[outing.slots.length - 1];
  const prompt = `
    Add a new stop (Stop ${newSlotIndex}) to this date plan for ${outing.date}.
    Current plan vibe: ${outing.vibe}.
    The previous stop ends at ${lastSlot?.end_time || outing.start_datetime}.
    Suggest a logical start_time and end_time for this new stop, and provide realistic venue opening hours for this day of the week.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          start_time: { type: Type.STRING },
          end_time: { type: Type.STRING },
          venue: VENUE_SCHEMA,
        },
        required: ["start_time", "end_time", "venue"]
      }
    },
  });

  const data = JSON.parse(response.text);
  return {
    slot_index: newSlotIndex,
    venue: data.venue,
    start_time: data.start_time,
    end_time: data.end_time,
    status: 'kept'
  };
};

export const swapSlot = async (outing: Outing, slotIndex: number, reason: string): Promise<Venue> => {
  const currentSlot = outing.slots.find(s => s.slot_index === slotIndex);
  const prompt = `
    The user wants to SWAP Stop ${slotIndex} on ${outing.date} because: "${reason}".
    Current venue: ${currentSlot?.venue.name}.
    Suggest ONE alternative venue with realistic opening hours for this specific day of the week.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: VENUE_SCHEMA,
    },
  });

  return JSON.parse(response.text);
};
