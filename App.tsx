
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView, Outing, LocationMode } from './types';
import Layout from './components/Layout';
import Step1Create from './components/Step1Create';
import Step2Itinerary from './components/Step2Itinerary';
import Step3Final from './components/Step3Final';
import History from './components/History';
import Onboarding from './components/Onboarding';
import Membership from './components/Membership';
import { planOutingLive } from './services/planner';
import { PlacesProvider } from './services/placesProvider';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('create');
  const [currentOuting, setCurrentOuting] = useState<Outing | null>(null);
  const [history, setHistory] = useState<Outing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('outing_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    const isComplete = localStorage.getItem('outing_onboarding_complete');
    if (isComplete === 'true') {
      setOnboardingComplete(true);
    } else {
      setOnboardingComplete(false);
      setView('onboarding');
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('outing_onboarding_complete', 'true');
    setOnboardingComplete(true);
    setView('create');
  };

  const handleGenerate = async (params: Partial<Outing>) => {
    setIsLoading(true);
    try {
      // 1. Resolve Location
      const { lat, lng, address } = await PlacesProvider.geocode(params.location_query!);
      
      // 2. Fetch Weather
      const weather = await PlacesProvider.getWeather(lat, lng, params.date!);

      // 3. Plan Itinerary
      const slots = await planOutingLive({
        centerLat: lat,
        centerLng: lng,
        date: params.date!,
        vibe: params.vibe!,
        budget: params.budget_level!,
        alcoholPref: params.alcohol_pref!,
        dietaryTags: params.dietary_tags!,
        rangeMiles: params.range_miles!,
        startTime: params.start_time!,
        weather
      });

      const newOuting: Outing = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        date: params.date!,
        location_query: params.location_query!,
        location_mode: LocationMode.CUSTOM,
        center_lat: lat,
        center_lng: lng,
        vibe: params.vibe!,
        budget_level: params.budget_level!,
        dietary_tags: params.dietary_tags!,
        alcohol_pref: params.alcohol_pref!,
        range_miles: params.range_miles!,
        indoor_outdoor: params.indoor_outdoor!,
        start_time: params.start_time!,
        slots,
        weather_snapshot: weather,
      };

      setCurrentOuting(newOuting);
      setView('itinerary');
    } catch (error: any) {
      alert(error.message || "Failed to generate plan. Please try again.");
      console.error("Generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = () => {
    if (!currentOuting) return;
    const updatedHistory = [currentOuting, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('outing_history', JSON.stringify(updatedHistory));
    setView('final');
  };

  const getTitle = () => {
    switch (view) {
      case 'create': return "Plan Outing";
      case 'itinerary': return "Review Options";
      case 'final': return "Confirmed";
      case 'history': return "History";
      case 'membership': return "Membership";
      default: return "Outing";
    }
  };

  if (onboardingComplete === null) return null;

  return (
    <div className="bg-[#121212] min-h-screen text-white">
      <AnimatePresence mode="wait">
        {view === 'onboarding' && (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {view !== 'onboarding' && (
        <Layout activeView={view} setView={setView} title={getTitle()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'create' && (
                <Step1Create onGenerate={handleGenerate} isLoading={isLoading} />
              )}
              {view === 'itinerary' && currentOuting && (
                <Step2Itinerary 
                  outing={currentOuting} 
                  setOuting={setCurrentOuting} 
                  onFinalize={handleFinalize}
                />
              )}
              {view === 'final' && currentOuting && (
                <Step3Final outing={currentOuting} />
              )}
              {view === 'history' && (
                <History history={history} onSelect={(o) => { setCurrentOuting(o); setView('final'); }} />
              )}
              {view === 'membership' && (
                <Membership onBack={() => setView('create')} />
              )}
            </motion.div>
          </AnimatePresence>
        </Layout>
      )}
    </div>
  );
};

export default App;
