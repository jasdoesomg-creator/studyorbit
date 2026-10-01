import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { SubjectType, TopicStatus } from '../types';
import { getAllSubjectSyllabuses } from '../utils/storage';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface LearningProgressProps {
  onSelectSubject?: (s: SubjectType) => void;
  onNavigateToTab?: (tab: 'syllabus' | 'notes' | 'quiz') => void;
}

interface SubjectStat {
  subject: SubjectType;
  total: number;
  mastered: number;
  inProgress: number;
  reviewNeeded: number;
  notStarted: number;
  percentage: number;
  color: string;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  onSelectSubject,
  onNavigateToTab,
}) => {
  const [viewMode, setViewMode] = useState<'status' | 'subject'>('status');
  const syllabuses = getAllSubjectSyllabuses();

  const subjects: { id: SubjectType; label: string; color: string; icon: React.ReactNode }[] = [
    { id: 'Maths', label: 'Maths', color: '#4f46e5', icon: <Calculator className="w-4 h-4 text-indigo-500" /> },
    { id: 'Physics', label: 'Physics', color: '#d97706', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'Chemistry', label: 'Chemistry', color: '#059669', icon: <FlaskConical className="w-4 h-4 text-emerald-500" /> },
    { id: 'Biology', label: 'Biology', color: '#e11d48', icon: <Dna className="w-4 h-4 text-rose-500" /> },
  ];

  // Calculate subject statistics
  const subjectStats: SubjectStat[] = subjects.map((s) => {
    const syllabus = syllabuses[s.id];
    const topics = syllabus ? syllabus.units.flatMap((u) => u.topics) : [];
    const total = topics.length;
    const mastered = topics.filter((t) => t.status === 'mastered').length;
    const inProgress = topics.filter((t) => t.status === 'in_progress').length;
    const reviewNeeded = topics.filter((t) => t.status === 'review_needed').length;
    const notStarted = topics.filter((t) => t.status === 'not_started').length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return {
      subject: s.id,
      total,
      mastered,
      inProgress,
      reviewNeeded,
      notStarted,
      percentage,
      color: s.color,
    };
  });

  // Aggregate stats across all four subjects
  const overallTotal = subjectStats.reduce((acc, curr) => acc + curr.total, 0);
  const overallMastered = subjectStats.reduce((acc, curr) => acc + curr.mastered, 0);
  const overallInProgress = subjectStats.reduce((acc, curr) => acc + curr.inProgress, 0);
  const overallReviewNeeded = subjectStats.reduce((acc, curr) => acc + curr.reviewNeeded, 0);
  const overallNotStarted = subjectStats.reduce((acc, curr) => acc + curr.notStarted, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallMastered / overallTotal) * 100) : 0;

  // Chart data for Status View (Mastered, In Progress, Needs Review, Not Started)
  const statusChartData = [
    { name: 'Mastered', value: overallMastered, color: '#10b981' },
    { name: 'In Progress', value: overallInProgress, color: '#f59e0b' },
    { name: 'Needs Review', value: overallReviewNeeded, color: '#ef4444' },
    { name: 'Not Started', value: overallNotStarted, color: '#e2e8f0' },
  ].filter((d) => d.value > 0);

  // Chart data for Subject View (Mastered topics per subject)
  const subjectChartData = subjectStats.map((s) => ({
    name: s.subject,
    value: s.mastered > 0 ? s.mastered : 0.01, // fallback to show segment
    displayValue: s.mastered,
    total: s.total,
    percentage: s.percentage,
    color: s.color,
  }));

  const handleSubjectClick = (s: SubjectType) => {
    if (onSelectSubject) onSelectSubject(s);
    if (onNavigateToTab) onNavigateToTab('syllabus');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-lg border border-slate-700 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            {data.name}
          </p>
          {viewMode === 'status' ? (
            <p className="text-slate-300">
              {data.value} of {overallTotal} Topics ({Math.round((data.value / overallTotal) * 100)}%)
            </p>
          ) : (
            <p className="text-slate-300">
              {data.displayValue} of {data.total} Mastered ({data.percentage}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
      {/* Component Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              Learning Progress
            </span>
            <span className="text-xs text-slate-500">
              Maths • Physics • Chemistry • Biology
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Syllabus Completion & Topic Mastery
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live circular progress tracking syllabus completion status across all four STEM subjects.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('status')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'status'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Status
          </button>
          <button
            type="button"
            onClick={() => setViewMode('subject')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'subject'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Subject
          </button>
        </div>
      </div>

      {/* Main Circular Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Recharts Circular Chart Container with Center Metric */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative min-h-[260px]">
          <div className="w-full h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={viewMode === 'status' ? statusChartData : subjectChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {(viewMode === 'status' ? statusChartData : subjectChartData).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Percentage & Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {overallPercentage}%
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                {overallMastered} of {overallTotal} Mastered
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 mt-1">
            {viewMode === 'status'
              ? 'Showing status breakdown across all 4 subjects'
              : 'Showing mastered topic share by subject'}
          </span>
        </div>

        {/* Legend & Aggregate Statistics */}
        <div className="md:col-span-6 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-emerald-950">Mastered Topics</span>
              </div>
              <span className="font-bold text-emerald-800">
                {overallMastered} ({overallTotal ? Math.round((overallMastered / overallTotal) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="font-semibold text-amber-950">In Progress</span>
              </div>
              <span className="font-bold text-amber-800">
                {overallInProgress} ({overallTotal ? Math.round((overallInProgress / overallTotal) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                <span className="font-semibold text-rose-950">Needs Review</span>
              </div>
              <span className="font-bold text-rose-800">
                {overallReviewNeeded} ({overallTotal ? Math.round((overallReviewNeeded / overallTotal) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
                <span className="font-medium text-slate-700">Not Started / Remaining</span>
              </div>
              <span className="font-semibold text-slate-600">
                {overallNotStarted} ({overallTotal ? Math.round((overallNotStarted / overallTotal) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Individual Subject Circular Progress Mini Cards */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Subject-by-Subject Progress Rings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {subjectStats.map((stat) => {
            const subjectData = [
              { name: 'Mastered', value: stat.mastered, color: stat.color },
              { name: 'Remaining', value: Math.max(0, stat.total - stat.mastered), color: '#f1f5f9' },
            ];

            return (
              <div
                key={stat.subject}
                onClick={() => handleSubjectClick(stat.subject)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/40 hover:bg-white cursor-pointer transition-all shadow-2xs hover:shadow-sm space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {subjects.find((s) => s.id === stat.subject)?.icon}
                    <span className="text-sm font-bold text-slate-900">{stat.subject}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>

                {/* Circular Mini Chart */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={28}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900 pointer-events-none">
                      {stat.percentage}%
                    </div>
                  </div>

                  <div className="text-xs space-y-0.5">
                    <div className="font-semibold text-slate-800">
                      {stat.mastered} / {stat.total} Topics
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {stat.total - stat.mastered} remaining
                    </div>
                    <div className="text-[10px] text-indigo-600 font-medium group-hover:underline">
                      View syllabus →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
