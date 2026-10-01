import React from 'react';
import {
  GraduationCap,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  BookOpen,
  FileText,
  CheckSquare,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { SubjectType } from '../types';

export type MainTab = 'syllabus' | 'notes' | 'quiz' | 'plan';

interface NavbarProps {
  activeSubject: SubjectType;
  onSelectSubject: (s: SubjectType) => void;
  activeTab: MainTab;
  onSelectTab: (t: MainTab) => void;
  onOpenExamModal: () => void;
  hasExam: boolean;
  daysRemaining: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSubject,
  onSelectSubject,
  activeTab,
  onSelectTab,
  onOpenExamModal,
  hasExam,
  daysRemaining,
}) => {
  const subjects: { id: SubjectType; label: string; icon: React.ReactNode; color: string; activeClasses: string }[] = [
    {
      id: 'Maths',
      label: 'Maths',
      icon: <Calculator className="w-4 h-4" />,
      color: 'indigo',
      activeClasses: 'bg-indigo-600 text-white shadow-xs',
    },
    {
      id: 'Physics',
      label: 'Physics',
      icon: <Zap className="w-4 h-4" />,
      color: 'amber',
      activeClasses: 'bg-amber-600 text-white shadow-xs',
    },
    {
      id: 'Chemistry',
      label: 'Chemistry',
      icon: <FlaskConical className="w-4 h-4" />,
      color: 'emerald',
      activeClasses: 'bg-emerald-600 text-white shadow-xs',
    },
    {
      id: 'Biology',
      label: 'Biology',
      icon: <Dna className="w-4 h-4" />,
      color: 'rose',
      activeClasses: 'bg-rose-600 text-white shadow-xs',
    },
  ];

  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'syllabus', label: 'Syllabus & Units', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes Simplifier', icon: <FileText className="w-4 h-4" /> },
    { id: 'quiz', label: 'Tests & Quizzes', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'plan', label: 'Revision Schedule', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with Logo, Exam Trigger & Subject Selector */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">StudyOrbit</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  STEM Prep
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Maths • Physics • Chemistry • Biology
              </p>
            </div>
          </div>

          {/* 4 Subjects Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {subjects.map((s) => {
              const isActive = activeSubject === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSubject(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    isActive ? s.activeClasses : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Exam Mode Toggle / Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExamModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hasExam
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Click to change your exam date or settings"
            >
              <span
                className={`w-2 h-2 rounded-full ${hasExam ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}
              />
              <span className="font-semibold">
                {hasExam ? `Exam in ${daysRemaining}d` : 'No Exam Set'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
