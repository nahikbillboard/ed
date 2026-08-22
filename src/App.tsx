import React, { useState, useEffect, useCallback } from 'react';
import { ApiClient } from './services/apiClient';
import { Header } from './components/common/Header';
import { SosModal } from './components/common/SosModal';
import { VoiceCallSimulationModal } from './components/common/VoiceCallSimulationModal';
import { WhatsAppNotificationModal } from './components/common/WhatsAppNotificationModal';
import { CompanionChatModal } from './components/common/CompanionChatModal';
import { GuardianDemoControls } from './components/guardian/GuardianDemoControls';

// Senior Views
import { SeniorHome } from './components/senior/SeniorHome';
import { SeniorWakeUp } from './components/senior/SeniorWakeUp';
import { SeniorWalking } from './components/senior/SeniorWalking';
import { SeniorBreathing } from './components/senior/SeniorBreathing';
import { SeniorYoga } from './components/senior/SeniorYoga';
import { SeniorMedicines } from './components/senior/SeniorMedicines';
import { SeniorMeals } from './components/senior/SeniorMeals';
import { SeniorSingleMeal } from './components/senior/SeniorSingleMeal';
import { SeniorSingleMedicine } from './components/senior/SeniorSingleMedicine';
import { SeniorRewards } from './components/senior/SeniorRewards';

// Guardian Views
import { GuardianDashboard } from './components/guardian/GuardianDashboard';
import { GuardianMedicines } from './components/guardian/GuardianMedicines';
import { GuardianSettings } from './components/guardian/GuardianSettings';

// Onboarding
import { SeniorOnboarding } from './components/onboarding/SeniorOnboarding';

import { TodayBundle, Senior, VoiceCallItem, NotificationItem, DailyRoutine, DailyActivity, SeniorProgress, Medicine } from './types';
import { Heart, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [role, setRole] = useState<'senior' | 'guardian' | 'onboarding'>('senior');
  const [seniorSubView, setSeniorSubView] = useState<'home' | 'wakeup' | 'walking' | 'breathing' | 'yoga' | 'meals' | 'medicines' | 'rewards' | 'breakfast' | 'lunch' | 'dinner' | 'breakfast_medicine' | 'lunch_medicine' | 'dinner_medicine'>('home');
  const [guardianSubView, setGuardianSubView] = useState<'dashboard' | 'medicines' | 'settings'>('dashboard');

  const [bundle, setBundle] = useState<TodayBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Overlays
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [activeVoiceCall, setActiveVoiceCall] = useState<VoiceCallItem | null>(null);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState<boolean>(false);
  const [activeWhatsApp, setActiveWhatsApp] = useState<NotificationItem | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isCompanionChatOpen, setIsCompanionChatOpen] = useState<boolean>(false);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load Today Bundle
  const loadData = useCallback(async (seniorId: string = 'senior_eleanor_01') => {
    try {
      const data = await ApiClient.getTodayBundle(seniorId);
      setBundle(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load bundle:', err);
      setError('Unable to reach KinCare server. Reconnecting...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Periodic refresh every 12 seconds for live telemetry
    const interval = setInterval(() => {
      if (bundle?.senior?.id) {
        loadData(bundle.senior.id);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [loadData, bundle?.senior?.id]);

  // Voice call trigger handler (from Demo drawer or Guardian)
  const handleTriggerVoiceCall = async (callType: VoiceCallItem['call_type']) => {
    if (!bundle) return;
    try {
      const call = await ApiClient.placeVoiceCall(bundle.senior.id, callType);
      setActiveVoiceCall(call);
      setIsVoiceCallOpen(true);
    } catch (e) {
      console.error('Voice call error:', e);
    }
  };

  // State update handlers from child views
  const handleWakeUpSuccess = (updatedRoutine: DailyRoutine, updatedProgress: SeniorProgress) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      routine: updatedRoutine,
      progress: updatedProgress,
    });
  };

  const handleActivityUpdated = (updatedAct: DailyActivity, updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      activity: updatedAct,
      routine: updatedRoutine,
      progress: updatedProg,
    });
  };

  const handleBreathingCompleted = (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      routine: updatedRoutine,
      progress: updatedProg,
    });
  };

  const handleExerciseCompleted = (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      routine: updatedRoutine,
      progress: updatedProg,
    });
  };

  const handleMedicineUpdated = (
    updatedMeds: Medicine[],
    updatedRoutine: DailyRoutine,
    updatedProg: SeniorProgress,
  ) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      medicines: updatedMeds,
      routine: updatedRoutine,
      progress: updatedProg,
    });
  };

  const handleMealCompleted = (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      routine: updatedRoutine,
      progress: updatedProg,
    });
  };

  const handleProgressUpdated = (updatedProg: SeniorProgress) => {
    if (!bundle) return;
    setBundle({
      ...bundle,
      progress: updatedProg,
    });
  };

  const handleSeniorCreated = (newSenior: Senior) => {
    loadData(newSenior.id);
    setRole('senior');
    setSeniorSubView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-2xl animate-bounce">
          <Heart className="w-9 h-9 text-white fill-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">KinCare AI</h2>
        <p className="text-stone-400 text-lg">“Care, even when you're far away.”</p>
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm pt-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Starting Senior Companion Engine...</span>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-stone-900 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-bold">KinCare Connecting...</h2>
        <p className="text-stone-600">{error || 'Initializing telemetry database.'}</p>
        <button
          onClick={() => loadData()}
          className="px-6 py-3 bg-stone-900 text-white font-bold rounded-2xl flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div id="kincare-app-root" className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans flex flex-col antialiased selection:bg-orange-100 selection:text-stone-900">
      {/* Header */}
      <Header
        currentView={role}
        onSelectView={(v) => {
          setRole(v);
          if (v === 'senior') setSeniorSubView('home');
          if (v === 'guardian') setGuardianSubView('dashboard');
        }}
        senior={bundle.senior}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenCompanionChat={() => setIsCompanionChatOpen(true)}
        onOpenDemoDrawer={() => setIsDemoDrawerOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 py-4 sm:py-6">
        {/* ROLE 1: SENIOR APP */}
        {role === 'senior' && (
          <div>
            {/* Sub Navigation Bar for Senior Mode */}
            {seniorSubView !== 'home' && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
                <button
                  id="senior-back-home-btn"
                  onClick={() => setSeniorSubView('home')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-800 font-bold text-base rounded-xl transition-all"
                >
                  <span>←</span>
                  <span>Back to Home</span>
                </button>

                <div className="text-sm font-bold text-stone-500">
                  {bundle.senior.name}'s Routine
                </div>
              </div>
            )}

            {seniorSubView === 'home' && (
              <SeniorHome
                senior={bundle.senior}
                routine={bundle.routine}
                activity={bundle.activity}
                progress={bundle.progress}
                medicines={bundle.medicines}
                onNavigate={(view) => setSeniorSubView(view)}
                onOpenSos={() => setIsSosOpen(true)}
                onTaskCompleted={(updatedRoutine, updatedProg, whatsappData) => {
                  setBundle({
                    ...bundle,
                    routine: updatedRoutine,
                    progress: updatedProg,
                  });
                  if (whatsappData) {
                    setActiveWhatsApp({
                      id: `notif_w_${Date.now()}`,
                      senior_id: bundle.senior.id,
                      channel: 'whatsapp',
                      title: `✅ Routine Update: ${bundle.senior.name}`,
                      message: whatsappData.message || 'Routine task completed.',
                      status: 'delivered',
                      created_at: new Date().toISOString(),
                    });
                    setIsWhatsAppOpen(true);
                  }
                }}
              />
            )}

            {seniorSubView === 'wakeup' && (
              <SeniorWakeUp
                senior={bundle.senior}
                routine={bundle.routine}
                progress={bundle.progress}
                onWakeUpSuccess={handleWakeUpSuccess}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'walking' && (
              <SeniorWalking
                senior={bundle.senior}
                activity={bundle.activity}
                routine={bundle.routine}
                progress={bundle.progress}
                onActivityUpdated={handleActivityUpdated}
                onNavigateBreathing={() => setSeniorSubView('breathing')}
              />
            )}

            {seniorSubView === 'breathing' && (
              <SeniorBreathing
                senior={bundle.senior}
                routine={bundle.routine}
                progress={bundle.progress}
                onBreathingCompleted={handleBreathingCompleted}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'yoga' && (
              <SeniorYoga
                senior={bundle.senior}
                exercises={bundle.exercises}
                routine={bundle.routine}
                progress={bundle.progress}
                onExerciseCompleted={handleExerciseCompleted}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'medicines' && (
              <SeniorMedicines
                senior={bundle.senior}
                medicines={bundle.medicines}
                routine={bundle.routine}
                progress={bundle.progress}
                onMedicineUpdated={handleMedicineUpdated}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'meals' && (
              <SeniorMeals
                senior={bundle.senior}
                routine={bundle.routine}
                progress={bundle.progress}
                onMealCompleted={handleMealCompleted}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'breakfast' && (
              <SeniorSingleMeal
                mealType="breakfast"
                senior={bundle.senior}
                routine={bundle.routine}
                progress={bundle.progress}
                onMealCompleted={handleMealCompleted}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'lunch' && (
              <SeniorSingleMeal
                mealType="lunch"
                senior={bundle.senior}
                routine={bundle.routine}
                progress={bundle.progress}
                onMealCompleted={handleMealCompleted}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'dinner' && (
              <SeniorSingleMeal
                mealType="dinner"
                senior={bundle.senior}
                routine={bundle.routine}
                progress={bundle.progress}
                onMealCompleted={handleMealCompleted}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'breakfast_medicine' && (
              <SeniorSingleMedicine
                medicineNumber={1}
                senior={bundle.senior}
                medicines={bundle.medicines}
                routine={bundle.routine}
                progress={bundle.progress}
                onMedicineUpdated={handleMedicineUpdated}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'lunch_medicine' && (
              <SeniorSingleMedicine
                medicineNumber={2}
                senior={bundle.senior}
                medicines={bundle.medicines}
                routine={bundle.routine}
                progress={bundle.progress}
                onMedicineUpdated={handleMedicineUpdated}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'dinner_medicine' && (
              <SeniorSingleMedicine
                medicineNumber={3}
                senior={bundle.senior}
                medicines={bundle.medicines}
                routine={bundle.routine}
                progress={bundle.progress}
                onMedicineUpdated={handleMedicineUpdated}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}

            {seniorSubView === 'rewards' && (
              <SeniorRewards
                senior={bundle.senior}
                progress={bundle.progress}
                rewards={bundle.rewards}
                onProgressUpdated={handleProgressUpdated}
                onNavigateHome={() => setSeniorSubView('home')}
              />
            )}
          </div>
        )}

        {/* ROLE 2: GUARDIAN DASHBOARD */}
        {role === 'guardian' && (
          <div>
            {guardianSubView === 'dashboard' && (
              <GuardianDashboard
                senior={bundle.senior}
                routine={bundle.routine}
                activity={bundle.activity}
                progress={bundle.progress}
                medicines={bundle.medicines}
                notifications={bundle.recentNotifications || []}
                onTriggerVoiceCall={handleTriggerVoiceCall}
                onNavigateMedicines={() => setGuardianSubView('medicines')}
                onNavigateSettings={() => setGuardianSubView('settings')}
                onRefreshData={() => loadData(bundle.senior.id)}
              />
            )}

            {guardianSubView === 'medicines' && (
              <GuardianMedicines
                senior={bundle.senior}
                medicines={bundle.medicines}
                onRefillOrdered={() => loadData(bundle.senior.id)}
                onBack={() => setGuardianSubView('dashboard')}
              />
            )}

            {guardianSubView === 'settings' && (
              <GuardianSettings
                senior={bundle.senior}
                onSeniorUpdated={(upd) => {
                  setBundle({ ...bundle, senior: upd });
                  setGuardianSubView('dashboard');
                }}
                onBack={() => setGuardianSubView('dashboard')}
              />
            )}
          </div>
        )}

        {/* ROLE 3: ONBOARDING */}
        {role === 'onboarding' && (
          <SeniorOnboarding
            onComplete={handleSeniorCreated}
            onCancel={() => setRole('senior')}
          />
        )}
      </main>

      {/* Persistent Modals & Simulation Overlays */}
      <SosModal
        senior={bundle.senior}
        contacts={bundle.emergencyContacts}
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSosTriggered={() => loadData(bundle.senior.id)}
      />

      <VoiceCallSimulationModal
        call={activeVoiceCall}
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        onActionConfirmed={(action) => {
          if (action === 'wakeup') {
            handleWakeUpSuccess({ ...bundle.routine, wake_status: 'completed' }, { ...bundle.progress, total_xp: bundle.progress.total_xp + 50 });
          }
          loadData(bundle.senior.id);
        }}
      />

      <CompanionChatModal
        senior={bundle.senior}
        isOpen={isCompanionChatOpen}
        onClose={() => setIsCompanionChatOpen(false)}
      />

      <GuardianDemoControls
        senior={bundle.senior}
        isOpen={isDemoDrawerOpen}
        onClose={() => setIsDemoDrawerOpen(false)}
        onEventDispatched={(call) => {
          if (call) {
            setActiveVoiceCall(call);
            setIsVoiceCallOpen(true);
          }
          loadData(bundle.senior.id);
        }}
        onDatabaseReset={() => loadData('senior_eleanor_01')}
      />
    </div>
  );
}
export default App;
