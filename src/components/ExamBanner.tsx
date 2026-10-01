import React from 'react';
import { Calendar, Flame, BookOpen, Settings2 } from 'lucide-react';
import { ExamProfile } from '../types';
import { calculateDaysRemaining } from '../utils/storage';

interface ExamBannerProps {
  profile: ExamProfile;
  onOpenSettings: () => void;
}

export const ExamBanner: React.FC<ExamBannerProps> = ({ profile, onOpenSettings }) => {
  const daysLeft = calculateDaysRemaining(profile.examDate);

  if (profile.hasExam) {
    const isUrgent = daysLeft <= 7;
    return (
      <div
        className={`w-full py-3 px-4 border-b transition-colors ${
          isUrgent
            ? 'bg-amber-500/10 border-amber-300 text-amber-950'
            : 'bg-indigo-50 border-indigo-200 text-indigo-950'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-1.5 rounded-lg flex items-center justify-center font-bold ${
                isUrgent ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
            </span>
            <div>
              <span className="font-semibold">{profile.examName}:</span>{' '}
              <span className="font-bold underline decoration-indigo-400">
                {daysLeft > 0 ? `${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left` : 'Exam is Imminent!'}
              </span>
              <span className="hidden sm:inline text-slate-600 ml-2">
                (Target: {profile.targetScore} • {profile.dailyStudyHours}h daily goal)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700 text-xs font-medium">
              ⚡ High-Yield Exam Mode Active
            </span>
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              Adjust Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not having an exam mode
  return (
    <div className="w-full py-2.5 px-4 bg-emerald-50/70 border-b border-emerald-200 text-emerald-950 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-600 text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          <span className="font-medium text-emerald-900">
            Steady Learning Mode: Deep conceptual mastery across Maths, Physics, Chemistry & Biology.
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
        >
          <Calendar className="w-3.5 h-3.5" />
          Set Upcoming Exam Date
        </button>
      </div>
    </div>
  );
};
