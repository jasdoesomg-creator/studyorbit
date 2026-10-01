import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { ExamProfile, StudyPlanResponse, SubjectType } from '../types';
import { StudyProgress } from './StudyProgress';
import { LearningProgress } from './LearningProgress';

interface StudyPlanViewProps {
  examProfile: ExamProfile;
  daysRemaining: number;
  onOpenExamModal: () => void;
  onSelectSubject: (s: SubjectType) => void;
  onNavigateToTab: (tab: 'syllabus' | 'notes' | 'quiz') => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  examProfile,
  daysRemaining,
  onOpenExamModal,
  onSelectSubject,
  onNavigateToTab,
}) => {
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressViewMode, setProgressViewMode] = useState<'milestones' | 'circular'>('milestones');

  useEffect(() => {
    if (examProfile.hasExam) {
      loadStudyPlan();
    }
  }, [examProfile.hasExam, daysRemaining, examProfile.dailyStudyHours]);

  const loadStudyPlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: ['Maths', 'Physics', 'Chemistry', 'Biology'],
          examDaysLeft: daysRemaining || 14,
          dailyHours: examProfile.dailyStudyHours || 3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudyPlan(data);
      }
    } catch (err) {
      console.error('Error fetching study plan', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subjectBadges: Record<SubjectType, { border: string; bg: string; text: string }> = {
    Maths: { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-800' },
    Physics: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800' },
    Chemistry: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-800' },
    Biology: { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-800' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                Revision Strategy
              </span>
              <span className="text-xs text-slate-500">
                4-Subject STEM Pacing
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Personalized Revision Timetable & Priorities
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Balances Mathematics, Physics, Chemistry, and Biology so you cover every topic without last-minute panic.
            </p>
          </div>

          <button
            onClick={onOpenExamModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs self-start md:self-auto"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            {examProfile.hasExam ? 'Adjust Exam Date' : 'Set Upcoming Exam'}
          </button>
        </div>
      </div>

      {/* View Switcher for Study Progress & Syllabus Milestones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Progress Tracking Mode:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setProgressViewMode('milestones')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                progressViewMode === 'milestones'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Study Progress & Milestones
            </button>
            <button
              type="button"
              onClick={() => setProgressViewMode('circular')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                progressViewMode === 'circular'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radial Breakdown Ring
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Tracks Maths, Physics, Chemistry & Biology syllabus topics
        </span>
      </div>

      {/* Render StudyProgress or LearningProgress based on chosen mode */}
      {progressViewMode === 'milestones' ? (
        <StudyProgress
          onSelectSubject={onSelectSubject}
          onNavigateToTab={onNavigateToTab}
          daysRemaining={daysRemaining}
        />
      ) : (
        <LearningProgress
          onSelectSubject={onSelectSubject}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {/* When Exam Mode is Active */}
      {examProfile.hasExam ? (
        <div className="space-y-6">
          {/* Countdown & Goal Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Countdown
                </span>
                <div className="text-xl font-bold text-slate-900">
                  {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Left
                </div>
                <span className="text-[11px] text-slate-500">{examProfile.examName}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Daily Study
                </span>
                <div className="text-xl font-bold text-slate-900">
                  {examProfile.dailyStudyHours || 3} Hours / Day
                </div>
                <span className="text-[11px] text-slate-500">Across 4 STEM Subjects</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Goal
                </span>
                <div className="text-xl font-bold text-slate-900">
                  {examProfile.targetScore || 'Grade A*'}
                </div>
                <span className="text-[11px] text-slate-500">Exam Benchmark</span>
              </div>
            </div>
          </div>

          {/* Phased Roadmap */}
          {isLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Calculating optimal 4-subject revision phases...</p>
            </div>
          ) : (
            studyPlan && (
              <div className="space-y-6">
                {/* Summary Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs md:text-sm text-indigo-950 font-medium flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>{studyPlan.summary}</span>
                </div>

                {/* Phased Schedule */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Phased Preparation Roadmap
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyPlan.phases.map((phase, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
                      >
                        <div className="border-b border-slate-100 pb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Phase {pIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {phase.phaseName}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">{phase.focus}</p>
                        </div>

                        {/* Subject Allocations */}
                        <div className="space-y-2">
                          {phase.subjectAllocations.map((alloc, aIdx) => {
                            const badge = subjectBadges[alloc.subject] || subjectBadges.Maths;
                            return (
                              <div
                                key={aIdx}
                                className={`p-3 rounded-xl border ${badge.border} ${badge.bg} flex items-start justify-between gap-3 text-xs`}
                              >
                                <div>
                                  <span className={`font-bold ${badge.text}`}>
                                    {alloc.subject}:
                                  </span>{' '}
                                  <span className="text-slate-700">{alloc.priorityAction}</span>
                                </div>
                                <span className="font-mono font-semibold text-slate-600 shrink-0">
                                  {alloc.recommendedHours}h
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Exam Strategies */}
                {studyPlan.topAdvice && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Key Rules for Exam Day Success
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {studyPlan.topAdvice.map((advice, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed"
                        >
                          <span className="font-bold text-slate-900 mr-1.5">#{idx + 1}</span>
                          {advice}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        /* When Exam Mode is OFF (Steady Mastery) */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Steady Foundation & Deep Learning Mode
                </h2>
                <p className="text-xs text-slate-500">
                  You are currently in regular study mode. No immediate exam deadline has been set.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Active Recall over Re-reading
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Instead of reading textbook chapters multiple times, use the Notes Simplifier to extract easy points, and immediately take a 5-question pop quiz to cement memory.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  Rotate the 4 Subjects Daily
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Avoid studying only one subject for 3 weeks straight. Alternate between computational subjects (Maths & Physics) and conceptual/mechanistic subjects (Chemistry & Biology).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-indigo-950">
                  Have an examination approaching?
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Set your exam date to activate high-yield formula cheat sheets, trap alerts, and timed tests.
                </p>
              </div>
              <button
                onClick={onOpenExamModal}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 shadow-xs"
              >
                Turn On Exam Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
