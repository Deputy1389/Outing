
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView, Outing } from './types';
import Layout from './components/Layout';
import Step1Create from './components/Step1Create';
import Step2Itinerary from './components/Step2Itinerary';
import Step3Final from './components/Step3Final';
import History from './components/History';
import Onboarding from './components/Onboarding';
import Membership from './components/Membership';
import { planOuting } from './services/planner';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('create');
  const [currentOuting, setCurrentOuting] = useState<Outing | null>(null);
  const [history, setHistory] = useState<Outing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Check history
    const savedHistory = localStorage.getItem('outing_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Check onboarding
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
    // Simulate slight delay for "calculating" feel
    setTimeout(() => {
      try {
        const { weather, slots } = planOuting({
          date: params.date || new Date().toISOString().split('T')[0],
          vibe: params.vibe!,
          budget: params.budget_level!,
          alcoholPref: params.alcohol_pref!,
          dietaryTags: params.dietary_tags!,
          range: params.range_miles!,
          startTime: params.start_time!
        });

        const newOuting: Outing = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          date: params.date!,
          location_mode: params.location_mode!,
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
      } catch (error) {
        console.error("Generation error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 800);
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
      case 'onboarding': return "";
      case 'create': return "Plan Outing";
      case 'itinerary': return "Review";
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
                <History 
                  history={history} 
                  onSelect={(outing) => {
                    setCurrentOuting(outing);
                    setView('final');
                  }} 
                />
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
