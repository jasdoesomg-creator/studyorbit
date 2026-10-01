import React, { useState } from 'react';
import { Calendar, Clock, Target, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ExamProfile } from '../types';
import { calculateDaysRemaining } from '../utils/storage';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ExamProfile;
  onSave: (updated: ExamProfile) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [hasExam, setHasExam] = useState<boolean>(profile.hasExam);
  const [examName, setExamName] = useState<string>(profile.examName);
  const [examDate, setExamDate] = useState<string>(profile.examDate);
  const [targetScore, setTargetScore] = useState<string>(profile.targetScore);
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(profile.dailyStudyHours || 3);

  if (!isOpen) return null;

  const daysRemaining = calculateDaysRemaining(examDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      hasExam,
      examName: examName.trim() || 'General Examination',
      examDate,
      targetScore: targetScore.trim() || 'Pass with High Marks',
      dailyStudyHours: Number(dailyStudyHours) || 3,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Exam Preparation Settings</h2>
            <p className="text-xs text-indigo-200 mt-1">
              Configure whether you have an upcoming test so StudyOrbit adapts your pace.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Toggle: Having an Exam or Not */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <label className="text-sm font-semibold text-slate-800 block mb-2">
              Are you currently preparing for an upcoming examination?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasExam(true)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  hasExam
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes, Exam Upcoming
              </button>
              <button
                type="button"
                onClick={() => setHasExam(false)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  !hasExam
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                No, Regular Study
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {hasExam
                ? 'Exam Mode activates countdowns, high-yield formula cheat sheets, and prioritized problem tests.'
                : 'Regular Study mode focuses on steady concept mastery without time pressure.'}
            </p>
          </div>

          {hasExam && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Exam Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exam Title / Description
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. STEM Term Finals, AP Physics & Calculus, Board Exams"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Exam Date & Days Countdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exam Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                  {daysRemaining > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      <Calendar className="w-3.5 h-3.5" />
                      {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining until exam day
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Exam is today or date has passed!
                    </span>
                  )}
                </div>
              </div>

              {/* Target Goal & Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Score / Grade
                  </label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      placeholder="e.g. 90% / Grade A*"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Daily Study Time
                  </label>
                  <select
                    value={dailyStudyHours}
                    onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value={1}>1 hour / day</option>
                    <option value={2}>2 hours / day</option>
                    <option value={3}>3 hours / day (Recommended)</option>
                    <option value={4}>4 hours / day</option>
                    <option value={5}>5+ hours (Sprint)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
