
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

// In-memory cache for efficiency/cost control
const cache = new Map();

app.get('/api/geocode', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query required' });
  
  const cacheKey = `geo_${query}`;
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query as string)}&key=${GOOGLE_KEY}`;
    const resp = await fetch(url);
    const data: any = await resp.json();
    
    if (data.status !== 'OK') return res.status(400).json({ error: 'Location not found' });
    
    const result = {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
      address: data.results[0].formatted_address
    };
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server geocoding error' });
  }
});

app.post('/api/venues/search', async (req, res) => {
  const { lat, lng, radiusMeters, categories, maxPrice, keyword } = req.body;
  
  try {
    // Google Places API (New) Text Search
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const body = {
      textQuery: `${keyword} near location`,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: Math.min(radiusMeters, 10000) // Max 10km bias for better precision
        }
      },
      maxResultCount: 15,
      priceLevels: maxPrice ? Array.from({length: maxPrice}, (_, i) => `PRICE_LEVEL_${i+1}`) : undefined
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY!,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.formattedAddress,places.photos,places.googleMapsUri'
      },
      body: JSON.stringify(body)
    });

    const data: any = await resp.json();
    
    const venues = (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.displayName?.text,
      lat: p.location.latitude,
      lng: p.location.longitude,
      address: p.formattedAddress,
      categories: p.types || [],
      priceLevel: p.priceLevel === 'PRICE_LEVEL_FREE' ? 0 : (p.priceLevel?.split('_').pop() || 2),
      rating: p.rating || 4.0,
      reviewCount: p.userRatingCount || 100,
      tags: p.types || [],
      alcoholType: (p.types || []).includes('bar') ? 'bar' : 'optional',
      hours: { openMorning: true, openEvening: true, openLate: true },
      imageUrl: p.photos ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_KEY}` : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
      mapsUrl: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query_place_id=${p.id}`
    }));

    res.json(venues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Places search failed' });
  }
});

app.get('/api/weather', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const resp = await fetch(url);
    const data: any = await resp.json();
    
    res.json({
      temp: Math.round((data.current_weather.temperature * 9/5) + 32),
      condition: 'Clear',
      precip_prob: 0
    });
  } catch (err) {
    res.json({ temp: 72, condition: 'Fair', precip_prob: 0 });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
