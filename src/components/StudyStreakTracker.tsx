import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  ArrowRight,
  Zap,
  FileText,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { StudyStreakData, StudySessionRecord } from '../types';
import { getStudyStreakData, getStoredSessions } from '../utils/streak';

interface StudyStreakTrackerProps {
  onNavigateToTab?: (tab: 'syllabus' | 'notes' | 'quiz' | 'plan') => void;
}

export const StudyStreakTracker: React.FC<StudyStreakTrackerProps> = ({
  onNavigateToTab,
}) => {
  const [streakData, setStreakData] = useState<StudyStreakData>(getStudyStreakData);
  const [recentSessions, setRecentSessions] = useState<StudySessionRecord[]>(() =>
    getStoredSessions().slice(0, 4)
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync streak state on custom window events
  useEffect(() => {
    const handleActivity = (e: any) => {
      const updated = e.detail?.streak || getStudyStreakData();
      setStreakData(updated);
      setRecentSessions(getStoredSessions().slice(0, 4));

      // Trigger a mini celebratory confetti if streak was just extended today
      if (updated.hasStudiedToday) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.1, x: 0.85 },
            colors: ['#f59e0b', '#ef4444', '#10b981'],
          });
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('studyorbit:study_activity', handleActivity);
    return () => {
      window.removeEventListener('studyorbit:study_activity', handleActivity);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.2, x: 0.8 },
        colors: ['#f59e0b', '#ec4899', '#4f46e5'],
      });
    } catch (e) {
      // ignore
    }
  };

  const streakDays = streakData.currentStreak;
  const isProtectedToday = streakData.hasStudiedToday;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Streak Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={`Study Streak: ${streakDays} consecutive days. ${
          isProtectedToday ? 'Streak active today' : 'Complete a session today to keep streak'
        }`}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs cursor-pointer select-none ${
          isProtectedToday
            ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border-amber-300 text-amber-950 hover:bg-amber-100/60'
            : streakDays > 0
            ? 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/80 animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
        title={
          isProtectedToday
            ? `Streak active: ${streakDays} day${streakDays === 1 ? '' : 's'} in a row!`
            : `Keep your ${streakDays}-day streak alive! Complete a quiz or note session today.`
        }
      >
        <span className="relative flex items-center justify-center">
          <Flame
            className={`w-4 h-4 transition-transform duration-300 ${
              isProtectedToday
                ? 'text-amber-500 fill-amber-500 drop-shadow-xs scale-105'
                : 'text-amber-600 fill-amber-500/30'
            }`}
          />
          {isProtectedToday && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
          )}
        </span>

        <span className="font-mono tabular-nums tracking-tight font-bold text-xs sm:text-sm">
          {streakDays}
        </span>
        <span className="text-[11px] font-medium hidden md:inline text-slate-700">
          {streakDays === 1 ? 'day streak' : 'days streak'}
        </span>
      </button>

      {/* Floating Detailed Streak Card / Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900"
          role="dialog"
          aria-label="Study Streak Details"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    {streakDays} Day Study Streak
                  </h3>
                  {streakDays >= 3 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      On Fire!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Consecutive days with a completed quiz or notes session
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Today's Streak Status Banner */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              isProtectedToday
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {isProtectedToday ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold text-xs">
                {isProtectedToday
                  ? "Streak Protected Today!"
                  : "Keep Your Streak Alive Today!"}
              </p>
              <p className="text-[11px] text-slate-600">
                {isProtectedToday
                  ? "Great job! You've completed at least one study session today. Return tomorrow to build your streak further."
                  : "You haven't completed a quiz or note session yet today. Complete one to maintain your daily streak!"}
              </p>
            </div>
          </div>

          {/* Last 7 Days Visual Calendar Tracker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Past 7 Days Activity</span>
              <span className="font-mono tabular-nums text-slate-600 lowercase font-medium">
                {streakData.recentDays.filter((d) => d.hasStudied).length}/7 days active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {streakData.recentDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    day.hasStudied
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold'
                      : day.isToday
                      ? 'bg-slate-50 border-slate-300 border-dashed text-slate-700'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                  title={`${day.date}: ${day.hasStudied ? 'Studied' : 'No recorded session'}`}
                >
                  <span className="text-[10px] font-medium">{day.dayLabel}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      day.hasStudied
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : day.isToday
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    {day.hasStudied ? (
                      <Flame className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                Current
              </span>
              <span className="text-base font-extrabold font-mono tabular-nums text-amber-600">
                {streakDays}d
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                Longest
              </span>
              <span className="text-base font-extrabold font-mono tabular-nums text-indigo-600">
                {streakData.longestStreak}d
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                Total Sessions
              </span>
              <span className="text-base font-extrabold font-mono tabular-nums text-slate-800">
                {streakData.totalSessions}
              </span>
            </div>
          </div>

          {/* Recent Activity Log */}
          {recentSessions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Recent Completed Sessions
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-32 overflow-y-auto">
                {recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-2 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {s.type === 'quiz' ? (
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate text-[11px]">
                          {s.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {s.subject} · {s.details || s.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {s.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            {!isProtectedToday ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onNavigateToTab) onNavigateToTab('quiz');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Take Quiz Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onNavigateToTab) onNavigateToTab('notes');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Summarize Notes</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Streak saved for today</span>
                </span>
                <button
                  type="button"
                  onClick={handleCelebrate}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Celebrate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
