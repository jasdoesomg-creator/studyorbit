import React, { useState } from 'react';
import {
  SubjectSyllabus,
  SubjectType,
  SyllabusTopic,
  TopicStatus,
} from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  FileText,
  CheckSquare,
  Upload,
  RotateCcw,
  Plus,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit3,
} from 'lucide-react';

interface SyllabusViewProps {
  syllabus: SubjectSyllabus;
  onUpdateSyllabus: (updated: SubjectSyllabus) => void;
  onResetSyllabus: () => void;
  onSelectTopicForNotes: (topic: SyllabusTopic) => void;
  onSelectTopicForQuiz: (topic: SyllabusTopic) => void;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  syllabus,
  onUpdateSyllabus,
  onResetSyllabus,
  onSelectTopicForNotes,
  onSelectTopicForQuiz,
}) => {
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [rawSyllabusInput, setRawSyllabusInput] = useState('');
  const [isParsingSyllabus, setIsParsingSyllabus] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Note editing state
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [studentNoteDraft, setStudentNoteDraft] = useState('');

  // Calculate statistics
  const allTopics = syllabus.units.flatMap((u) => u.topics);
  const totalTopics = allTopics.length;
  const masteredCount = allTopics.filter((t) => t.status === 'mastered').length;
  const inProgressCount = allTopics.filter((t) => t.status === 'in_progress').length;
  const reviewNeededCount = allTopics.filter((t) => t.status === 'review_needed').length;
  const notStartedCount = allTopics.filter((t) => t.status === 'not_started').length;
  const completionPercentage = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

  const toggleUnit = (unitId: string) => {
    setCollapsedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const updateTopicStatus = (topicId: string, newStatus: TopicStatus) => {
    const updatedUnits = syllabus.units.map((unit) => ({
      ...unit,
      topics: unit.topics.map((t) => (t.id === topicId ? { ...t, status: newStatus } : t)),
    }));
    onUpdateSyllabus({ ...syllabus, units: updatedUnits });
  };

  const openNoteEditor = (topic: SyllabusTopic) => {
    setEditingTopic(topic);
    setStudentNoteDraft(topic.studentNotes || topic.sampleNotes || '');
  };

  const saveStudentNotes = () => {
    if (!editingTopic) return;
    const updatedUnits = syllabus.units.map((unit) => ({
      ...unit,
      topics: unit.topics.map((t) =>
        t.id === editingTopic.id ? { ...t, studentNotes: studentNoteDraft } : t
      ),
    }));
    onUpdateSyllabus({ ...syllabus, units: updatedUnits });
    setEditingTopic(null);
  };

  const handleImportSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSyllabusInput.trim()) return;

    setIsParsingSyllabus(true);
    setImportError(null);

    try {
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: syllabus.subject,
          rawSyllabusText: rawSyllabusInput,
        }),
      });

      if (!res.ok) throw new Error('Failed to parse syllabus text');
      const data = await res.json();

      if (data && Array.isArray(data.units) && data.units.length > 0) {
        // Format topics with default status
        const formattedUnits = data.units.map((u: any, uIdx: number) => ({
          id: u.id || `u-${uIdx + 1}`,
          title: u.title || `Unit ${uIdx + 1}`,
          weightage: u.weightage || 'High',
          topics: (u.topics || []).map((t: any, tIdx: number) => ({
            id: t.id || `t-${uIdx + 1}-${tIdx + 1}`,
            title: t.title || `Topic ${tIdx + 1}`,
            importance: t.importance || 'Core',
            status: 'not_started' as TopicStatus,
            sampleNotes: `Key curriculum notes for ${t.title || 'this topic'}.`,
          })),
        }));

        onUpdateSyllabus({ ...syllabus, units: formattedUnits });
        setIsImportModalOpen(false);
        setRawSyllabusInput('');
      } else {
        throw new Error('Could not identify units from syllabus text');
      }
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'Error parsing syllabus. Please check your text.');
    } finally {
      setIsParsingSyllabus(false);
    }
  };

  const statusIcons: Record<TopicStatus, { icon: React.ReactNode; label: string; badgeClass: string }> = {
    not_started: {
      icon: <Circle className="w-3.5 h-3.5 text-slate-400" />,
      label: 'Not Started',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    in_progress: {
      icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
      label: 'In Progress',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    mastered: {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
      label: 'Mastered',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    review_needed: {
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
      label: 'Needs Review',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  return (
    <div className="space-y-6">
      {/* Subject Header & Coverage Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {syllabus.subject} Syllabus
              </span>
              <span className="text-xs text-slate-500">
                {syllabus.units.length} Modules • {totalTopics} Topics
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {syllabus.subject} Course Roadmap & Exam Progress
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track what you have studied, simplify notes into high-yield points, or conduct practice tests on any topic.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import My Syllabus
            </button>
            <button
              onClick={onResetSyllabus}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Reset to default standard curriculum"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Standard
            </button>
          </div>
        </div>

        {/* Progress Metrics Bar */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
            <span className="font-semibold text-slate-800">Syllabus Mastery: {completionPercentage}%</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {masteredCount} Mastered
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {inProgressCount} In Progress
              </span>
              <span className="flex items-center gap-1 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {reviewNeededCount} Needs Review
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                {notStartedCount} Unread
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${totalTopics ? (masteredCount / totalTopics) * 100 : 0}%` }}
              title="Mastered"
            />
            <div
              className="bg-amber-400 transition-all duration-500"
              style={{ width: `${totalTopics ? (inProgressCount / totalTopics) * 100 : 0}%` }}
              title="In Progress"
            />
            <div
              className="bg-rose-400 transition-all duration-500"
              style={{ width: `${totalTopics ? (reviewNeededCount / totalTopics) * 100 : 0}%` }}
              title="Needs Review"
            />
          </div>
        </div>
      </div>

      {/* Units & Topics List */}
      <div className="space-y-4">
        {syllabus.units.map((unit, uIdx) => {
          const isCollapsed = collapsedUnits[unit.id];
          const unitMastered = unit.topics.filter((t) => t.status === 'mastered').length;

          return (
            <div
              key={unit.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
            >
              {/* Unit Header */}
              <div
                onClick={() => toggleUnit(unit.id)}
                className="px-6 py-4 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between border-b border-slate-200/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {uIdx + 1}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{unit.title}</h2>
                    <span className="text-xs text-slate-500">
                      {unit.topics.length} topics • {unitMastered}/{unit.topics.length} mastered
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      unit.weightage === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {unit.weightage} Exam Weight
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Topics inside unit */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100">
                  {unit.topics.map((topic) => {
                    const currentStatus = statusIcons[topic.status];

                    return (
                      <div
                        key={topic.id}
                        className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Topic Title & Badges */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{topic.title}</h3>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                topic.importance === 'Core'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : topic.importance === 'Advanced'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {topic.importance}
                            </span>
                            {topic.studentNotes && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Notes Saved
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {topic.studentNotes
                              ? topic.studentNotes.slice(0, 100) + '...'
                              : topic.sampleNotes
                              ? topic.sampleNotes.slice(0, 100) + '...'
                              : 'No notes yet. Click Simplify or Edit to add.'}
                          </p>
                        </div>

                        {/* Status Dropdown & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Status Selector */}
                          <select
                            value={topic.status}
                            onChange={(e) => updateTopicStatus(topic.id, e.target.value as TopicStatus)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${currentStatus.badgeClass}`}
                          >
                            <option value="not_started">⚪ Not Started</option>
                            <option value="in_progress">🟡 In Progress</option>
                            <option value="mastered">🟢 Mastered</option>
                            <option value="review_needed">🔴 Needs Review</option>
                          </select>

                          {/* Quick Simplify Button */}
                          <button
                            onClick={() => onSelectTopicForNotes(topic)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                            title="Translate topic notes into easy points & summary"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-300" />
                            Simplify Notes
                          </button>

                          {/* Test Topic Button */}
                          <button
                            onClick={() => onSelectTopicForQuiz(topic)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                            title="Generate quiz on this specific topic"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                            Test Topic
                          </button>

                          {/* Edit Notes */}
                          <button
                            onClick={() => openNoteEditor(topic)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit notes for this topic"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note Editor Drawer / Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {syllabus.subject} Topic Notes
              </span>
              <h2 className="text-lg font-bold text-slate-900">{editingTopic.title}</h2>
              <p className="text-xs text-slate-500">
                Paste your teacher's lecture notes, textbook excerpt, or study points.
              </p>
            </div>

            <textarea
              rows={8}
              value={studentNoteDraft}
              onChange={(e) => setStudentNoteDraft(e.target.value)}
              placeholder="Paste lecture notes or formulas here..."
              className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStudentNoteDraft(editingTopic.sampleNotes || '')}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Reset to Standard Sample Notes
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveStudentNotes}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Custom Syllabus Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Import Custom {syllabus.subject} Syllabus</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Paste course outlines, chapter lists, or teacher guidelines.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSyllabus} className="p-6 space-y-4">
              {importError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {importError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Paste Syllabus Text
                </label>
                <textarea
                  rows={9}
                  value={rawSyllabusInput}
                  onChange={(e) => setRawSyllabusInput(e.target.value)}
                  placeholder={`Example:
Unit 1: Differential Equations
- First order separable equations
- Integrating factor method
- Applications to growth and decay

Unit 2: Linear Algebra
- Eigenvalues and Eigenvectors
- Diagonalization of matrices`}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Organizes into structured chapters automatically.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isParsingSyllabus}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-2"
                  >
                    {isParsingSyllabus ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Analyzing Syllabus...
                      </>
                    ) : (
                      'Import into Course'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
