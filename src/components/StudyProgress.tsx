import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Trophy,
  Sparkles,
  Target,
  BookmarkCheck,
  TrendingUp,
  BookOpen,
  Check,
} from 'lucide-react';
import { SubjectType, TopicStatus, SyllabusTopic, SyllabusUnit } from '../types';
import { getAllSubjectSyllabuses } from '../utils/storage';

interface StudyProgressProps {
  onSelectSubject?: (s: SubjectType) => void;
  onNavigateToTab?: (tab: 'syllabus' | 'notes' | 'quiz') => void;
  daysRemaining?: number;
}

interface SubjectProgressData {
  subject: SubjectType;
  label: string;
  totalTopics: number;
  masteredCount: number;
  inProgressCount: number;
  reviewNeededCount: number;
  notStartedCount: number;
  completionPercentage: number;
  coreTopicsTotal: number;
  coreTopicsMastered: number;
  units: {
    id: string;
    title: string;
    weightage: 'High' | 'Medium' | 'Low';
    total: number;
    mastered: number;
    percentage: number;
  }[];
  color: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  progressBarColor: string;
  icon: React.ReactNode;
}

interface MilestoneDef {
  id: number;
  title: string;
  targetPercentage: number;
  description: string;
  badgeLabel: string;
  tacticalFocus: string;
}

const REVISION_MILESTONES: MilestoneDef[] = [
  {
    id: 1,
    title: 'Foundational Grounding',
    targetPercentage: 25,
    description: 'Master core principles, definitions, and foundational formulas.',
    badgeLabel: 'Bronze Milestone',
    tacticalFocus: 'Focus on High-Weightage definitions & basic equation manipulations.',
  },
  {
    id: 2,
    title: 'Core Competency',
    targetPercentage: 50,
    description: 'Halfway mark! Solid command over standard problem types.',
    badgeLabel: 'Silver Milestone',
    tacticalFocus: 'Transition to timed active recall and multi-step derivations.',
  },
  {
    id: 3,
    title: 'Mastery Sprint',
    targetPercentage: 75,
    description: 'Advanced units conquered and common trap questions neutralized.',
    badgeLabel: 'Gold Milestone',
    tacticalFocus: 'Focus on tricky boundary cases, synthesis problems, and rapid pop quizzes.',
  },
  {
    id: 4,
    title: 'Exam Distinction',
    targetPercentage: 100,
    description: 'Full syllabus mastery with zero unrevised blindspots.',
    badgeLabel: 'Diamond Ready',
    tacticalFocus: 'Comprehensive full-length simulations and formula recall drills.',
  },
];

export const StudyProgress: React.FC<StudyProgressProps> = ({
  onSelectSubject,
  onNavigateToTab,
  daysRemaining,
}) => {
  const [expandedSubject, setExpandedSubject] = useState<SubjectType | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'lowest' | 'highest'>('default');
  const [selectedMilestoneTab, setSelectedMilestoneTab] = useState<number | null>(null);

  const syllabuses = getAllSubjectSyllabuses();

  const subjectsConfig: {
    id: SubjectType;
    label: string;
    color: string;
    lightBg: string;
    borderColor: string;
    textColor: string;
    progressBarColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'Maths',
      label: 'Mathematics',
      color: '#4f46e5',
      lightBg: 'bg-indigo-50/50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-900',
      progressBarColor: 'bg-indigo-600',
      icon: <Calculator className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'Physics',
      label: 'Physics',
      color: '#d97706',
      lightBg: 'bg-amber-50/50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      progressBarColor: 'bg-amber-600',
      icon: <Zap className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'Chemistry',
      label: 'Chemistry',
      color: '#059669',
      lightBg: 'bg-emerald-50/50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      progressBarColor: 'bg-emerald-600',
      icon: <FlaskConical className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'Biology',
      label: 'Biology',
      color: '#e11d48',
      lightBg: 'bg-rose-50/50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-900',
      progressBarColor: 'bg-rose-600',
      icon: <Dna className="w-5 h-5 text-rose-600" />,
    },
  ];

  // Process data for all subjects
  const subjectProgressList: SubjectProgressData[] = subjectsConfig.map((cfg) => {
    const syllabus = syllabuses[cfg.id];
    const topics: SyllabusTopic[] = syllabus ? syllabus.units.flatMap((u) => u.topics) : [];
    const totalTopics = topics.length;
    const masteredCount = topics.filter((t) => t.status === 'mastered').length;
    const inProgressCount = topics.filter((t) => t.status === 'in_progress').length;
    const reviewNeededCount = topics.filter((t) => t.status === 'review_needed').length;
    const notStartedCount = topics.filter((t) => t.status === 'not_started').length;
    const completionPercentage =
      totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

    const coreTopics = topics.filter((t) => t.importance === 'Core');
    const coreTopicsTotal = coreTopics.length;
    const coreTopicsMastered = coreTopics.filter((t) => t.status === 'mastered').length;

    const units = (syllabus?.units || []).map((u) => {
      const uTopics = u.topics;
      const uMastered = uTopics.filter((t) => t.status === 'mastered').length;
      const uPercentage =
        uTopics.length > 0 ? Math.round((uMastered / uTopics.length) * 100) : 0;
      return {
        id: u.id,
        title: u.title,
        weightage: u.weightage,
        total: uTopics.length,
        mastered: uMastered,
        percentage: uPercentage,
      };
    });

    return {
      subject: cfg.id,
      label: cfg.label,
      totalTopics,
      masteredCount,
      inProgressCount,
      reviewNeededCount,
      notStartedCount,
      completionPercentage,
      coreTopicsTotal,
      coreTopicsMastered,
      units,
      color: cfg.color,
      lightBg: cfg.lightBg,
      borderColor: cfg.borderColor,
      textColor: cfg.textColor,
      progressBarColor: cfg.progressBarColor,
      icon: cfg.icon,
    };
  });

  // Calculate overall STEM metrics across all 4 subjects
  const overallTotalTopics = subjectProgressList.reduce((acc, curr) => acc + curr.totalTopics, 0);
  const overallMasteredTopics = subjectProgressList.reduce(
    (acc, curr) => acc + curr.masteredCount,
    0
  );
  const overallInProgressTopics = subjectProgressList.reduce(
    (acc, curr) => acc + curr.inProgressCount,
    0
  );
  const overallReviewNeededTopics = subjectProgressList.reduce(
    (acc, curr) => acc + curr.reviewNeededCount,
    0
  );
  const overallPercentage =
    overallTotalTopics > 0
      ? Math.round((overallMasteredTopics / overallTotalTopics) * 100)
      : 0;

  // Find achieved milestones & next milestone
  const achievedMilestones = REVISION_MILESTONES.filter(
    (m) => overallPercentage >= m.targetPercentage
  );
  const currentHighestMilestone =
    achievedMilestones.length > 0
      ? achievedMilestones[achievedMilestones.length - 1]
      : null;
  const nextMilestone = REVISION_MILESTONES.find(
    (m) => overallPercentage < m.targetPercentage
  );

  const topicsNeededForNextMilestone = nextMilestone
    ? Math.max(
        1,
        Math.ceil((nextMilestone.targetPercentage / 100) * overallTotalTopics) -
          overallMasteredTopics
      )
    : 0;

  // Sorting
  const sortedSubjects = [...subjectProgressList].sort((a, b) => {
    if (sortBy === 'lowest') return a.completionPercentage - b.completionPercentage;
    if (sortBy === 'highest') return b.completionPercentage - a.completionPercentage;
    return 0; // default order: Maths, Physics, Chemistry, Biology
  });

  const toggleExpand = (subject: SubjectType) => {
    setExpandedSubject((prev) => (prev === subject ? null : subject));
  };

  const handleLaunchConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  const getSubjectMilestoneBadge = (pct: number) => {
    if (pct >= 100) return { label: 'Distinction 100%', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 75) return { label: 'Gold Milestone (75%+)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (pct >= 50) return { label: 'Silver Milestone (50%+)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (pct >= 25) return { label: 'Bronze Milestone (25%+)', color: 'text-slate-700 bg-slate-100 border-slate-200' };
    return { label: 'Kickoff Stage', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-7">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-indigo-700">Study Progress</span>
            <span aria-hidden="true">·</span>
            <span>STEM Syllabus Milestones</span>
            {daysRemaining !== undefined && daysRemaining > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-700 font-medium">
                  {daysRemaining} days until exam
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-600 shrink-0" />
            <span>Syllabus Completion & Revision Milestones</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Track visual completion percentages across Mathematics, Physics, Chemistry, and
            Biology. Reach key revision benchmarks to guarantee complete curriculum mastery.
          </p>
        </div>

        {/* Action & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setSortBy('default')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
                sortBy === 'default'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              STEM Order
            </button>
            <button
              type="button"
              onClick={() => setSortBy('lowest')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
                sortBy === 'lowest'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Focus First
            </button>
            <button
              type="button"
              onClick={() => setSortBy('highest')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
                sortBy === 'highest'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highest Mastery
            </button>
          </div>

          {currentHighestMilestone && (
            <button
              type="button"
              onClick={handleLaunchConfetti}
              title="Celebrate your revision milestone achievement"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Celebrate</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Overall STEM Mastery Banner & Progress Ring Metric */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm">
        {/* Left Column: Big Overall Circular Percentage Gauge */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-center gap-5 justify-center sm:justify-start">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="text-slate-700 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="text-indigo-400 stroke-current transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * overallPercentage) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight">
                {overallPercentage}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider">
                Overall
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              Aggregate STEM Completion
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {overallMasteredTopics} of {overallTotalTopics} Topics Mastered
            </h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
              <span>{overallInProgressTopics} in progress</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-300">{overallReviewNeededTopics} need review</span>
              <span aria-hidden="true">·</span>
              <span>{overallTotalTopics - overallMasteredTopics} remaining</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Revision Milestone Status */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-0.5">
                <Target className="w-3.5 h-3.5" />
                <span>
                  {currentHighestMilestone
                    ? `Current Milestone: ${currentHighestMilestone.badgeLabel}`
                    : 'Kickoff: Starting Syllabus Coverage'}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                {currentHighestMilestone ? currentHighestMilestone.title : 'Building Core Foundations'}
              </h4>
            </div>

            {nextMilestone && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 whitespace-nowrap">
                Next: {nextMilestone.targetPercentage}% Target
              </span>
            )}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {nextMilestone ? (
              <span>
                You need <strong className="text-white font-mono tabular-nums">{topicsNeededForNextMilestone} more topic{topicsNeededForNextMilestone === 1 ? '' : 's'}</strong> to unlock the <strong>{nextMilestone.badgeLabel} ({nextMilestone.targetPercentage}%)</strong>. {nextMilestone.tacticalFocus}
              </span>
            ) : (
              <span className="text-emerald-300 font-medium">
                Congratulations! You have achieved 100% full syllabus mastery across all STEM subjects. Peak exam readiness achieved!
              </span>
            )}
          </p>

          {/* Micro Visual Bar for Next Milestone Target */}
          {nextMilestone && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Progress to {nextMilestone.title}</span>
                <span className="font-mono tabular-nums font-semibold">
                  {overallPercentage} / {nextMilestone.targetPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((overallPercentage / nextMilestone.targetPercentage) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Milestone Road Stepper (4 Milestones) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            Revision Milestone Roadmap
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click any milestone for revision focus advice
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REVISION_MILESTONES.map((m) => {
            const isCompleted = overallPercentage >= m.targetPercentage;
            const isCurrentTarget = nextMilestone?.id === m.id;
            const isSelected = selectedMilestoneTab === m.id;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMilestoneTab((prev) => (prev === m.id ? null : m.id))}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-2 relative ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : isCurrentTarget
                    ? 'border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/60 ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      isCompleted
                        ? 'text-emerald-800 bg-emerald-100/70 border-emerald-300'
                        : isCurrentTarget
                        ? 'text-indigo-800 bg-indigo-100/70 border-indigo-300'
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}
                  >
                    {m.targetPercentage}% Milestone
                  </span>

                  <div className="shrink-0">
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : isCurrentTarget ? (
                      <span className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                    {m.description}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrentTarget
                        ? 'text-indigo-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓ Reached' : isCurrentTarget ? 'Active Focus' : 'Locked'}
                  </span>
                  <span className="text-slate-400 font-mono tabular-nums">
                    {Math.min(overallPercentage, m.targetPercentage)}% / {m.targetPercentage}%
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 bg-white p-2 rounded-lg space-y-1">
                    <p className="font-semibold text-slate-900">Tactical Strategy:</p>
                    <p>{m.tacticalFocus}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Subject Syllabus Visual Completion Percentage Cards (All 4 STEM Subjects) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
              <span>Subject-by-Subject Syllabus Completion</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual percentages and unit breakdown for Mathematics, Physics, Chemistry, and
              Biology. Click any subject card to inspect individual unit coverage.
            </p>
          </div>

          <span className="text-xs text-slate-500 font-medium self-start sm:self-auto">
            Showing {sortedSubjects.length} STEM subjects
          </span>
        </div>

        {/* 4 Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedSubjects.map((subjectData) => {
            const isExpanded = expandedSubject === subjectData.subject;
            const milestoneBadge = getSubjectMilestoneBadge(subjectData.completionPercentage);

            // Calculate percentage breakdown for multi-segment bar
            const masteredPct =
              subjectData.totalTopics > 0
                ? Math.round((subjectData.masteredCount / subjectData.totalTopics) * 100)
                : 0;
            const inProgressPct =
              subjectData.totalTopics > 0
                ? Math.round((subjectData.inProgressCount / subjectData.totalTopics) * 100)
                : 0;
            const reviewNeededPct =
              subjectData.totalTopics > 0
                ? Math.round((subjectData.reviewNeededCount / subjectData.totalTopics) * 100)
                : 0;
            const notStartedPct = Math.max(
              0,
              100 - masteredPct - inProgressPct - reviewNeededPct
            );

            return (
              <div
                key={subjectData.subject}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                    : `${subjectData.borderColor} hover:border-slate-400/80 shadow-2xs`
                }`}
              >
                {/* Main Card Header */}
                <div className={`p-5 ${subjectData.lightBg} border-b border-slate-100`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                        {subjectData.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {subjectData.label}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${milestoneBadge.color}`}
                          >
                            {milestoneBadge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{subjectData.units.length} Units</span>
                          <span aria-hidden="true">·</span>
                          <span>{subjectData.totalTopics} Total Topics</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Core: {subjectData.coreTopicsMastered}/{subjectData.coreTopicsTotal}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Big Percentage Metric */}
                    <div className="text-right shrink-0">
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                        {subjectData.completionPercentage}%
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Mastered
                      </span>
                    </div>
                  </div>

                  {/* Multi-Segment Visual Completion Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                      {/* Mastered Segment */}
                      {masteredPct > 0 && (
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${masteredPct}%` }}
                          title={`Mastered: ${subjectData.masteredCount} (${masteredPct}%)`}
                        />
                      )}
                      {/* In Progress Segment */}
                      {inProgressPct > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${inProgressPct}%` }}
                          title={`In Progress: ${subjectData.inProgressCount} (${inProgressPct}%)`}
                        />
                      )}
                      {/* Needs Review Segment */}
                      {reviewNeededPct > 0 && (
                        <div
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${reviewNeededPct}%` }}
                          title={`Needs Review: ${subjectData.reviewNeededCount} (${reviewNeededPct}%)`}
                        />
                      )}
                      {/* Not Started Segment */}
                      {notStartedPct > 0 && (
                        <div
                          className="h-full bg-slate-200 transition-all duration-500"
                          style={{ width: `${notStartedPct}%` }}
                          title={`Not Started: ${subjectData.notStartedCount} (${notStartedPct}%)`}
                        />
                      )}
                    </div>

                    {/* Unboxed Legend & Counts */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-0.5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          <span>{subjectData.masteredCount} Mastered</span>
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                          <span>{subjectData.inProgressCount} In Progress</span>
                        </span>
                        {subjectData.reviewNeededCount > 0 && (
                          <span className="flex items-center gap-1 font-medium text-rose-700">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                            <span>{subjectData.reviewNeededCount} Needs Review</span>
                          </span>
                        )}
                      </div>

                      <span className="text-slate-400 font-mono tabular-nums">
                        {subjectData.notStartedCount} unstarted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Controls & Unit Expansion */}
                <div className="p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(subjectData.subject)}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      <span>
                        {isExpanded ? 'Hide Unit Breakdown' : `Inspect ${subjectData.units.length} Units`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {/* Quick Subject Action Links */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectSubject) onSelectSubject(subjectData.subject);
                          if (onNavigateToTab) onNavigateToTab('notes');
                        }}
                        className="text-slate-600 hover:text-indigo-700 hover:underline font-medium"
                      >
                        Notes
                      </button>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectSubject) onSelectSubject(subjectData.subject);
                          if (onNavigateToTab) onNavigateToTab('quiz');
                        }}
                        className="text-slate-600 hover:text-indigo-700 hover:underline font-medium"
                      >
                        Quiz
                      </button>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectSubject) onSelectSubject(subjectData.subject);
                          if (onNavigateToTab) onNavigateToTab('syllabus');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5"
                      >
                        <span>Syllabus</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Unit-by-Unit Visual Breakdown */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Unit Syllabus Coverage</span>
                        <span>Mastery Ratio</span>
                      </div>

                      {subjectData.units.map((unit) => (
                        <div
                          key={unit.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{unit.title}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                                    unit.weightage === 'High'
                                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                                      : unit.weightage === 'Medium'
                                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                                      : 'text-slate-600 bg-slate-100 border-slate-200'
                                  }`}
                                >
                                  {unit.weightage} Weight
                                </span>
                              </div>
                            </div>
                            <span className="font-mono tabular-nums font-bold text-slate-800 shrink-0">
                              {unit.mastered}/{unit.total} ({unit.percentage}%)
                            </span>
                          </div>

                          {/* Unit Micro Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${unit.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Revision Milestone Strategy Guidance Footer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">
              How are Revision Milestones Calculated?
            </h4>
            <p className="text-slate-500 mt-0.5">
              Each syllabus topic you change to <strong>Mastered</strong> in the Syllabus view
              contributes directly to your overall STEM completion rate and unlocks higher milestone
              badges.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onNavigateToTab) onNavigateToTab('syllabus');
          }}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
        >
          Update Topic Statuses in Syllabus →
        </button>
      </div>
    </div>
  );
};
