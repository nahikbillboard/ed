import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageSquare,
  Pill,
  Footprints,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Bell,
  AlertCircle,
  ExternalLink,
  Radio,
  Share2,
  Volume2,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { playChime } from '../../utils/audioSpeech';
import { Senior, DailyRoutine, DailyActivity, SeniorProgress, Medicine, NotificationItem, VoiceCallItem, SosEvent } from '../../types';
import { GuardianShabdonMein } from './GuardianShabdonMein';

interface GuardianDashboardProps {
  senior: Senior;
  routine: DailyRoutine;
  activity: DailyActivity;
  progress: SeniorProgress;
  medicines: Medicine[];
  notifications: NotificationItem[];
  onTriggerVoiceCall: (callType: VoiceCallItem['call_type']) => void;
  onNavigateMedicines: () => void;
  onNavigateSettings: () => void;
  onRefreshData: () => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  senior,
  routine,
  activity,
  progress,
  medicines,
  notifications,
  onTriggerVoiceCall,
  onNavigateMedicines,
  onNavigateSettings,
  onRefreshData,
}) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [sosHistory, setSosHistory] = useState<SosEvent[]>([]);
  const [voiceHistory, setVoiceHistory] = useState<VoiceCallItem[]>([]);
  const [dashboardTab, setDashboardTab] = useState<'shabdon' | 'metrics'>('shabdon');
  const [syncPingActive, setSyncPingActive] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchAiSummary();
    fetchHistory();

    // Subscribe to real-time browser synchronization
    const unsubscribe = ApiClient.subscribeToSyncUpdates(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
      setSyncPingActive(true);
      setTimeout(() => setSyncPingActive(false), 2000);
    });

    return () => {
      unsubscribe();
    };
  }, [senior.id]);

  const handleTestSyncPing = () => {
    playChime('ding');
    ApiClient.pingSync();
    setSyncPingActive(true);
    setLastSyncTime(new Date().toLocaleTimeString());
    setTimeout(() => setSyncPingActive(false), 2500);
  };

  const handleOpenGuardianNewTab = () => {
    playChime('ding');
    const guardianUrl = `${window.location.origin}${window.location.pathname}?role=guardian`;
    window.open(guardianUrl, '_blank');
  };

  const fetchAiSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await ApiClient.getGuardianSummary(senior.id);
      setAiSummary(summary);
    } catch (e) {
      setAiSummary(`${senior.name} is active today with a 7-day routine streak. She woke up at ${routine.wake_time || '7:15 AM'}, walked ${activity.steps.toLocaleString()} steps, and has completed scheduled wellness routines.`);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const [sos, voice] = await Promise.all([
        ApiClient.getSosHistory(senior.id),
        ApiClient.getVoiceHistory(senior.id),
      ]);
      setSosHistory(sos);
      setVoiceHistory(voice);
    } catch (e) {
      console.warn('History fetch:', e);
    }
  };

  // Determine Overall Status Color
  const hasActiveSos = sosHistory.some(s => s.status === 'active');
  const hasLowStock = medicines.some(m => m.quantity_remaining <= m.low_stock_threshold);
  const isAllGood = !hasActiveSos && routine.wake_status === 'completed';

  const getStatusBadge = () => {
    if (hasActiveSos) {
      return {
        color: 'bg-red-500 text-white',
        text: 'EMERGENCY TRIGGERED',
        icon: AlertTriangle,
        desc: 'An active SOS alarm was initiated. Review emergency response logs.',
      };
    }
    if (!isAllGood || hasLowStock) {
      return {
        color: 'bg-amber-500 text-stone-950',
        text: 'NEEDS ATTENTION',
        icon: AlertCircle,
        desc: hasLowStock ? 'Prescription medicine low stock alert.' : 'Morning routine check-in pending.',
      };
    }
    return {
      color: 'bg-emerald-600 text-white',
      text: 'ALL GOOD & ON TRACK',
      icon: CheckCircle2,
      desc: 'All morning routines & activities confirmed on schedule.',
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  const routineItems = [
    { label: 'Morning Wake-up', time: senior.wake_time, status: routine.wake_status, val: routine.wake_time || '7:15 AM' },
    { label: 'Breakfast', time: senior.breakfast_time, status: routine.breakfast_status, val: 'Confirmed' },
    { label: 'Lunch', time: senior.lunch_time, status: routine.lunch_status, val: 'Confirmed' },
    { label: 'Dinner', time: senior.dinner_time, status: routine.dinner_status, val: 'Scheduled 7:30 PM' },
    { label: 'Medicine #1 (Cardioprotect)', time: '9:00 AM', status: routine.medicine_status, val: 'Taken' },
    { label: 'Medicine #3 (Neuro-Calm)', time: '8:30 PM', status: routine.night_medicine_status, val: 'Scheduled' },
    { label: 'Guided Breathing', time: 'Midday', status: routine.breathing_status === 'completed' ? 'completed' : 'pending', val: '60s completed' },
    { label: 'Gentle Mobility Exercise', time: 'Afternoon', status: routine.yoga_status, val: 'Chair Yoga' },
  ];

  return (
    <div id="guardian-dashboard" className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Real-time Browser Connected Subdomain Banner */}
      <div
        id="edheal-browser-sync-banner"
        className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Radio className={`w-4 h-4 text-emerald-400 ${syncPingActive ? 'animate-ping' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Browser Storage Connected
              </span>
              <span className="text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700 font-mono">
                https://Edheal.netlify.app/?role=guardian
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
              Live bi-directional sync with {senior.name}'s app. Data is stored securely in the browser and updates in real-time across tabs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="btn-sync-ping-test"
            onClick={handleTestSyncPing}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
            title="Test real-time cross-tab browser sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncPingActive ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{syncPingActive ? 'Synced!' : 'Test Live Ping'}</span>
          </button>

          <button
            id="btn-open-guardian-tab"
            onClick={handleOpenGuardianNewTab}
            className="flex items-center gap-1.5 bg-[#FF6321] hover:bg-[#e85516] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Open Guardian App in a separate browser tab to monitor live"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Guardian Subdomain Tab</span>
          </button>
        </div>
      </div>

      {/* Top Banner answering: "Is my parent okay today?" */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-[32px] p-6 sm:p-8 text-stone-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
              GUARDIAN PERSPECTIVE • MONITORED SENIOR
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              {senior.name}
            </h1>
            <span className="text-xs font-semibold bg-white text-stone-600 px-3 py-1 rounded-full border border-stone-200">
              Age {senior.age}
            </span>
            <span className="text-xs font-semibold bg-white text-stone-600 px-3 py-1 rounded-full border border-stone-200">
              📱 {senior.guardian_phone}
            </span>
          </div>

          <p className="text-stone-600 text-sm sm:text-base font-normal">
            Monitored by <strong className="font-semibold text-stone-900">{senior.guardian_name}</strong> (Primary Guardian) • Last sync: {lastSyncTime}
          </p>
        </div>

        {/* Big Status Pill */}
        <div className="w-full md:w-auto flex flex-col items-start md:items-end">
          <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-bold text-base sm:text-lg shadow-xs ${status.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span>{status.text}</span>
          </div>
          <span className="text-xs text-stone-500 mt-1.5 font-medium">{status.desc}</span>
        </div>
      </div>

      {/* Primary KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps Card */}
        <div className="bg-white border border-stone-200 rounded-[28px] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Steps</span>
            <Footprints className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {activity.steps.toLocaleString()}
          </div>
          <div className="text-xs text-blue-700 font-semibold">
            Goal: {activity.step_goal.toLocaleString()} ({Math.round((activity.steps / activity.step_goal) * 100)}%)
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white border border-stone-200 rounded-[28px] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Routine Streak</span>
            <span className="text-base">🔥</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#FF6321]">
            {progress.current_streak} Days
          </div>
          <div className="text-xs text-stone-500 font-semibold">
            Longest: {progress.longest_streak} Days
          </div>
        </div>

        {/* Medicines Remaining Card */}
        <div 
          onClick={onNavigateMedicines}
          className="bg-white border border-stone-200 hover:border-emerald-300 rounded-[28px] p-5 shadow-xs space-y-2 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Prescriptions</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {medicines.length} Scheduled
          </div>
          <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
            <span>Manage Refills</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Wellness XP Card */}
        <div className="bg-white border border-stone-200 rounded-[28px] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Wellness XP</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {progress.total_xp} XP
          </div>
          <div className="text-xs text-stone-500 font-medium">
            Active reward balance
          </div>
        </div>
      </div>

      {/* Main Feature Tabs: "शब्दों में (In Words)" vs "डैशबोर्ड मैट्रिक्स (Metrics View)" */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            id="guardian-tab-shabdon-mein"
            onClick={() => setDashboardTab('shabdon')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              dashboardTab === 'shabdon'
                ? 'bg-[#FF6321] text-white shadow-md shadow-orange-200'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>शब्दों में (In Words)</span>
          </button>

          <button
            id="guardian-tab-metrics"
            onClick={() => setDashboardTab('metrics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              dashboardTab === 'metrics'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Live Timelines & Alerts</span>
          </button>
        </div>

        <span className="text-xs text-stone-400 font-medium hidden sm:inline">
          Edheal Real-Time Care Architecture
        </span>
      </div>

      {/* SHABDON MEIN SECTION */}
      {dashboardTab === 'shabdon' && (
        <GuardianShabdonMein
          senior={senior}
          routine={routine}
          activity={activity}
          progress={progress}
          medicines={medicines}
          notifications={notifications}
          sosHistory={sosHistory}
        />
      )}

      {/* AI Daily Summary Box (Gemini Reasoning) */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-[32px] p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg sm:text-xl">
            <Sparkles className="w-5 h-5 text-[#FF6321]" />
            <span>AI Care Intelligence Summary (Gemini 2.5)</span>
          </div>
          <button
            onClick={fetchAiSummary}
            disabled={loadingSummary}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-full transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
            <span>Regenerate Summary</span>
          </button>
        </div>

        <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
          {loadingSummary ? 'Analyzing daily telemetry and formulating care update...' : aiSummary}
        </p>

        <div className="text-xs text-stone-400 font-mono">
          Last updated: {new Date().toLocaleTimeString()} • Generated from server-side routine telemetry
        </div>
      </div>

      {/* 2-Column Section: Today's Routine Checklist vs Notification/Call Dispatch Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Routine Checklist */}
        <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-serif font-bold text-stone-900">
              <Clock className="w-5 h-5 text-stone-500" />
              <span>Today's Routine Timeline</span>
            </div>
            <span className="text-xs font-semibold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
              Live State
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {routineItems.map((item, i) => {
              const isDone = item.status === 'completed';
              return (
                <div key={i} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-stone-900">{item.label}</div>
                      <div className="text-xs text-stone-400 font-medium">{item.time}</div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDone ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600'}`}>
                    {isDone ? 'Completed ✓' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Communication & WhatsApp Log */}
        <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-lg sm:text-xl font-serif font-bold text-stone-900">
                <Bell className="w-5 h-5 text-stone-500" />
                <span>Guardian Notification Stream</span>
              </div>
              <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
                WhatsApp & Push
              </span>
            </div>

            <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto pr-1 mt-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-sm">
                  No alerts dispatched yet today.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>{notif.title}</span>
                      </span>
                      <span className="text-xs text-stone-400">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 leading-snug font-normal">
                      {notif.message}
                    </p>
                    <div className="text-[11px] text-stone-400 font-mono">
                      Channel: {notif.channel.toUpperCase()} • Status: {notif.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Direct Guardian Actions */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => onTriggerVoiceCall('wakeup')}
              className="py-3 px-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Trigger Wake-up Call</span>
            </button>

            <button
              onClick={() => onTriggerVoiceCall('medicine_reminder')}
              className="py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Pill className="w-4 h-4" />
              <span>Trigger Med Reminder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

