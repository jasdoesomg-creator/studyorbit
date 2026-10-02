import React, { useState, useEffect } from 'react';
import {
  SubjectType,
  SyllabusTopic,
  SubjectSyllabus,
  NotesSummary,
  ExamProfile,
} from '../types';
import {
  FileText,
  Sparkles,
  Zap,
  Brain,
  AlertTriangle,
  RotateCw,
  Copy,
  Printer,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Upload,
  Clipboard,
  Eraser,
  Calculator,
  FlaskConical,
  Dna,
  Cloud,
} from 'lucide-react';
import { recordStudySession } from '../utils/streak';

interface NotesSimplifierViewProps {
  activeSubject: SubjectType;
  onSelectSubject?: (s: SubjectType) => void;
  syllabus: SubjectSyllabus;
  initialTopic?: SyllabusTopic | null;
  examProfile: ExamProfile;
  daysRemaining: number;
  onLaunchQuizForTopic: (topicTitle: string) => void;
  onOpenDriveModal?: (prefilledNote?: { title: string; content: string }) => void;
  importedDriveNote?: { content: string; fileName: string } | null;
}

const SAMPLE_NOTES: Record<SubjectType, { title: string; notes: string }> = {
  Maths: {
    title: 'Differentiation & Integration Rules',
    notes: `Calculus Revision Notes:
1. Product Rule: d/dx [u*v] = u'v + uv'.
2. Quotient Rule: d/dx [u/v] = (u'v - uv') / (v^2). Mnemonic: (Low d-High minus High d-Low) over Low squared.
3. Chain Rule: d/dx [f(g(x))] = f'(g(x)) * g'(x). Remember to multiply by inner derivative!
4. Integration by Parts: int [u dv] = u*v - int [v du]. Use LIATE priority to pick u: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.
5. Critical points: set dy/dx = 0. Use second derivative test: if f''(c) > 0, local minimum; if f''(c) < 0, local maximum.`,
  },
  Physics: {
    title: "Newton's Laws & Work-Energy Theorem",
    notes: `Mechanics Core Notes:
- Newton's 1st Law: Object remains at rest or constant velocity unless acted upon by a net external force (inertia).
- Newton's 2nd Law: F_net = m * a (vector equation). Always draw Free Body Diagram (FBD) first.
- Newton's 3rd Law: For every action, there is an equal and opposite reaction acting on DIFFERENT objects.
- Friction: Static friction f_s <= mu_s * N; Kinetic friction f_k = mu_k * N. Normal force N = mg cos(theta) on an inclined plane.
- Work done: W = F * d * cos(theta). Work-Energy Theorem: Total Work = Delta KE = 0.5 * m * (v_f^2 - v_i^2).
- Gravitational Potential Energy PE = m*g*h. Total mechanical energy is conserved in absence of friction/air drag.`,
  },
  Chemistry: {
    title: "Chemical Equilibrium & Le Chatelier's Principle",
    notes: `Physical Chemistry Summary:
- Equilibrium constant K_eq = [products]^coefficients / [reactants]^coefficients. Pure solids and pure liquids are omitted from K expressions.
- Reaction quotient Q: if Q < K, system proceeds forward to form products. If Q > K, shifts backward to form reactants.
- Le Chatelier's Principle: If an external stress (concentration, pressure, temperature) is applied to an equilibrium mixture, the system adjusts to counteract that stress.
- Pressure effect: Increasing pressure (decreasing volume) favors the side with FEWER gas moles.
- Temperature effect: Exothermic (Delta H < 0) releases heat; increasing temperature shifts equilibrium to reactants and decreases K. Endothermic (Delta H > 0) absorbs heat; increasing temperature shifts to products and increases K. Note: Temperature is the only variable that alters K!
- Buffers: pH = pKa + log([A-]/[HA]) (Henderson-Hasselbalch equation). Highest buffer capacity when pH = pKa.`,
  },
  Biology: {
    title: 'DNA Replication & Central Dogma',
    notes: `Molecular Genetics Notes:
- Central Dogma of Molecular Biology: DNA -> (Transcription in nucleus) -> mRNA -> (Translation at ribosome) -> Polypeptide Protein.
- DNA Structure: Double helix with antiparallel strands (5' to 3' and 3' to 5'). Complementary base pairing: A pairs with T (2 hydrogen bonds), G pairs with C (3 hydrogen bonds).
- DNA Replication: Semi-conservative process.
  * Helicase: unwinds and separates DNA strands at the replication fork.
  * Primase: synthesizes short RNA primers to provide a free 3'-OH end.
  * DNA Polymerase III: synthesizes new DNA strictly in 5' to 3' direction. Continuous on leading strand; discontinuous on lagging strand producing Okazaki fragments.
  * DNA Ligase: seals phosphodiester nicks between Okazaki fragments.
- Translation: Ribosome reads mRNA codons. Start codon = AUG (Methionine). Stop codons = UAA, UAG, UGA. tRNA anticodons bring specific amino acids.`,
  },
};

export const NotesSimplifierView: React.FC<NotesSimplifierViewProps> = ({
  activeSubject,
  onSelectSubject,
  syllabus,
  initialTopic,
  examProfile,
  daysRemaining,
  onLaunchQuizForTopic,
  onOpenDriveModal,
  importedDriveNote,
}) => {
  const allTopics = syllabus.units.flatMap((u) => u.topics);

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopic?.id || (allTopics.length > 0 ? allTopics[0].id : '')
  );
  const [customTopicTitle, setCustomTopicTitle] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<NotesSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'points' | 'formulas' | 'traps' | 'mnemonics' | 'flashcards'>('points');
  const [copied, setCopied] = useState<boolean>(false);

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [knownCards, setKnownCards] = useState<Record<number, boolean>>({});

  // When initialTopic or activeSubject changes
  useEffect(() => {
    if (initialTopic) {
      setSelectedTopicId(initialTopic.id);
      setNotesInput(initialTopic.studentNotes || initialTopic.sampleNotes || '');
    } else if (allTopics.length > 0 && !allTopics.some((t) => t.id === selectedTopicId)) {
      setSelectedTopicId(allTopics[0].id);
      setNotesInput(allTopics[0].studentNotes || allTopics[0].sampleNotes || '');
    }
  }, [activeSubject, initialTopic]);

  // When a note is imported from Google Drive
  useEffect(() => {
    if (importedDriveNote) {
      setNotesInput(importedDriveNote.content);
      setSelectedTopicId('custom');
      setCustomTopicTitle(importedDriveNote.fileName.replace(/\.[^/.]+$/, ''));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [importedDriveNote]);

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    const found = allTopics.find((t) => t.id === topicId);
    if (found) {
      setNotesInput(found.studentNotes || found.sampleNotes || '');
    }
  };

  const loadPresetNotes = (subj: SubjectType) => {
    if (onSelectSubject && subj !== activeSubject) {
      onSelectSubject(subj);
    }
    const sample = SAMPLE_NOTES[subj];
    setCustomTopicTitle(sample.title);
    setSelectedTopicId('custom');
    setNotesInput(sample.notes);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setNotesInput(text);
    };
    reader.readAsText(file);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setNotesInput(text);
      }
    } catch (e) {
      console.warn('Clipboard read failed or permission denied', e);
    }
  };

  const currentTopicObj = allTopics.find((t) => t.id === selectedTopicId);
  const currentTopicName = selectedTopicId === 'custom'
    ? customTopicTitle.trim() || `${activeSubject} Topic`
    : currentTopicObj?.title || `${activeSubject} Notes`;

  const handleSummarize = async () => {
    if (!notesInput.trim() && !currentTopicName) {
      setErrorMsg('Please paste student notes or select a topic to summarize.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSummaryData(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCards({});

    try {
      const res = await fetch('/api/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeSubject,
          topic: currentTopicName,
          rawNotes: notesInput,
          hasExam: examProfile.hasExam,
          examDaysLeft: daysRemaining,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to summarize notes.');
      }

      const data = await res.json();
      setSummaryData(data);
      setActiveTab('points');

      // Record study session to build and maintain the user's daily study streak
      recordStudySession(
        'note',
        activeSubject,
        `${currentTopicName} Revision Notes`,
        'Distilled key points, formulas & exam traps'
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while generating the summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const textLines = [
      `# ${summaryData.title} (${activeSubject} Revision Sheet)`,
      `\n## Overview\n${summaryData.summaryOverview}`,
      `\n## Key Points & Easy Explanations:`,
      ...summaryData.easyPoints.map((p, i) => `${i + 1}. ${p.point}\n   ${p.explanation}`),
      `\n## Essential Formulas & Rules:`,
      ...(summaryData.cheatSheetFormulas || []).map((f) => `- ${f.formula}: ${f.meaning} (${f.unitsOrConditions || 'N/A'})`),
      `\n## Common Exam Traps:`,
      ...(summaryData.commonTraps || []).map((t) => `- Mistake: ${t.mistake}\n  How to avoid: ${t.howToAvoid}`),
      `\n## Mnemonics & Memory Aids:`,
      ...(summaryData.mnemonics || []).map((m) => `- "${m.phrase}": ${m.standsFor} (${m.appliedTo})`),
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSummaryToDrive = () => {
    if (!summaryData) return;
    const textLines = [
      `# ${summaryData.title} (${activeSubject} Revision Sheet)`,
      `\n## Overview\n${summaryData.summaryOverview}`,
      `\n## Key Points & Easy Explanations:`,
      ...summaryData.easyPoints.map((p, i) => `${i + 1}. ${p.point}\n   ${p.explanation}`),
      `\n## Essential Formulas & Rules:`,
      ...(summaryData.cheatSheetFormulas || []).map((f) => `- ${f.formula}: ${f.meaning} (${f.unitsOrConditions || 'N/A'})`),
      `\n## Common Exam Traps:`,
      ...(summaryData.commonTraps || []).map((t) => `- Mistake: ${t.mistake}\n  How to avoid: ${t.howToAvoid}`),
      `\n## Mnemonics & Memory Aids:`,
      ...(summaryData.mnemonics || []).map((m) => `- "${m.phrase}": ${m.standsFor} (${m.appliedTo})`),
    ];

    if (onOpenDriveModal) {
      onOpenDriveModal({
        title: `${activeSubject} - ${summaryData.title}`,
        content: textLines.join('\n'),
      });
    }
  };

  const subjectsList: { id: SubjectType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'Maths', label: 'Maths', icon: <Calculator className="w-4 h-4" />, color: 'indigo' },
    { id: 'Physics', label: 'Physics', icon: <Zap className="w-4 h-4" />, color: 'amber' },
    { id: 'Chemistry', label: 'Chemistry', icon: <FlaskConical className="w-4 h-4" />, color: 'emerald' },
    { id: 'Biology', label: 'Biology', icon: <Dna className="w-4 h-4" />, color: 'rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Feature Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                AI Notes Summarizer & Simplifier
              </span>
              <span className="text-xs text-slate-500">
                Tailored for {activeSubject} Exam Prep
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Transform Student Notes into Easy Points & Summaries
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Paste your raw lecture notes, textbook excerpts, or equations. The AI outputs a concise summary with key points, plain-English explanations, and examiner trap alerts suitable for examination preparation.
            </p>
          </div>

          {examProfile.hasExam && (
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 self-start md:self-auto">
              <span className="font-bold">Exam Mode Active:</span> Highlighting test traps & high-frequency formulas ({daysRemaining} days left).
            </div>
          )}
        </div>

        {/* Quick Subject Selector inside the feature */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Active Subject:
          </span>
          {subjectsList.map((s) => {
            const isActive = activeSubject === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSubject && onSelectSubject(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Input Workspace on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Notes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Notes Input
              </h2>
              <span className="text-[11px] font-medium text-slate-500">
                {activeSubject}
              </span>
            </div>

            {/* Quick Sample Note Loaders */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Load Quick Sample Notes:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loadPresetNotes('Maths')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-[11px] font-medium text-slate-700 text-left truncate flex items-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Maths (Calculus)
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetNotes('Physics')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-[11px] font-medium text-slate-700 text-left truncate flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Physics (Mechanics)
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetNotes('Chemistry')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-[11px] font-medium text-slate-700 text-left truncate flex items-center gap-1.5 transition-colors"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Chemistry (Equilibrium)
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetNotes('Biology')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 text-[11px] font-medium text-slate-700 text-left truncate flex items-center gap-1.5 transition-colors"
                >
                  <Dna className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  Biology (Genetics)
                </button>
              </div>
            </div>

            {/* Topic Selector or Custom Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic or Title (Optional)
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => handleSelectTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.importance})
                  </option>
                ))}
                <option value="custom">✏️ Enter Custom Topic or Infer from Notes...</option>
              </select>
            </div>

            {selectedTopicId === 'custom' && (
              <div>
                <input
                  type="text"
                  value={customTopicTitle}
                  onChange={(e) => setCustomTopicTitle(e.target.value)}
                  placeholder="e.g. SN1 vs SN2 Mechanisms, Newton's Laws, Optics"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Notes Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Student Notes Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-3 h-3" />
                    Paste
                  </button>
                  {onOpenDriveModal && (
                    <button
                      type="button"
                      onClick={() => onOpenDriveModal()}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-50 transition-colors"
                      title="Import notes from Google Drive"
                    >
                      <Cloud className="w-3 h-3" />
                      Google Drive
                    </button>
                  )}
                  <label className="text-[11px] font-medium text-slate-600 hover:text-slate-800 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Upload .txt
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {notesInput && (
                    <button
                      type="button"
                      onClick={() => setNotesInput('')}
                      className="text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-0.5"
                      title="Clear notes"
                    >
                      <Eraser className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={11}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder={`Type or paste ${activeSubject} notes here (lecture slides, textbook definitions, formulas, or homework summaries)...`}
                className="w-full p-3.5 text-xs font-mono text-slate-800 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{notesInput.length} characters</span>
                <span>AI will extract key points & formulas</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleSummarize}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Concise Exam Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Summarize & Simplify Notes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output */}
        <div className="lg:col-span-7">
          {!summaryData && !isLoading && (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                AI Notes Simplification & Exam Preparation
              </h3>
              <p className="text-xs md:text-sm text-slate-500 max-w-md mt-1 mb-6">
                Paste your notes on the left or click any of the 4 quick sample buttons (Maths, Physics, Chemistry, Biology) to instantly generate concise key points, formulas, and examiner traps.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    loadPresetNotes(activeSubject);
                    setTimeout(() => handleSummarize(), 50);
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try With {activeSubject} Sample Notes
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-900">Synthesizing & Simplifying Notes...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Distilling core concepts, translating technical jargon into easy points, extracting formulas, and preparing high-yield exam takeaways for{' '}
                <span className="font-semibold text-indigo-700">{currentTopicName}</span>.
              </p>
            </div>
          )}

          {summaryData && !isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
              {/* Output Header */}
              <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/10 text-indigo-200">
                    {activeSubject} Exam Revision Summary
                  </span>
                  <h2 className="text-xl font-bold tracking-tight mt-1">{summaryData.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {summaryData.summaryOverview}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <button
                    onClick={handleCopySummary}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Copy revision sheet"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Print revision sheet"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {onOpenDriveModal && (
                    <button
                      type="button"
                      onClick={handleSaveSummaryToDrive}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/40 text-blue-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Save this revision guide to your Google Drive"
                    >
                      <Cloud className="w-3.5 h-3.5 text-blue-300" />
                      <span className="hidden md:inline">Save to Drive</span>
                    </button>
                  )}
                  <button
                    onClick={() => onLaunchQuizForTopic(summaryData.title)}
                    className="px-3.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    Test Topic
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Easy Points / Formulas / Traps / Mnemonics / Flashcards */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto print:hidden">
                <button
                  onClick={() => setActiveTab('points')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'points'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📌 Key Points & Explanations ({summaryData.easyPoints?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('formulas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'formulas'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Formulas & Laws ({summaryData.cheatSheetFormulas?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('traps')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'traps'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚠️ Exam Traps ({summaryData.commonTraps?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('mnemonics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'mnemonics'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🧠 Mnemonics ({summaryData.mnemonics?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'flashcards'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🗂️ Flashcards ({summaryData.flashcards?.length || 0})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {/* 1. KEY POINTS & EASY EXPLANATIONS */}
                {activeTab === 'points' && (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Key Points with Easy-to-Understand Explanations (Exam-Ready)
                    </div>
                    {summaryData.easyPoints?.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3.5 hover:bg-slate-50 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">{p.point}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {p.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. FORMULAS & LAWS */}
                {activeTab === 'formulas' && (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Essential Formulas, Laws & Boundary Conditions
                    </div>
                    {summaryData.cheatSheetFormulas && summaryData.cheatSheetFormulas.length > 0 ? (
                      summaryData.cheatSheetFormulas.map((f, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                              Formula #{idx + 1}
                            </span>
                            {f.unitsOrConditions && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-900 font-semibold">
                                {f.unitsOrConditions}
                              </span>
                            )}
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-indigo-100 font-mono text-sm md:text-base font-bold text-indigo-950">
                            {f.formula}
                          </div>
                          <p className="text-xs text-slate-700">{f.meaning}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No specific mathematical formulas defined for this qualitative topic.
                      </p>
                    )}
                  </div>
                )}

                {/* 3. EXAM TRAPS */}
                {activeTab === 'traps' && (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Frequent Mistakes & Examiner Pitfalls
                    </div>
                    {summaryData.commonTraps?.map((trap, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-600 text-white">
                            Exam Trap #{idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-rose-950">{trap.mistake}</h4>
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong className="text-slate-700">Why it happens: </strong>
                          {trap.whyItHappens}
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-rose-200/80 text-xs text-emerald-900 font-medium flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <strong className="text-emerald-700">How to avoid: </strong>
                            {trap.howToAvoid}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. MNEMONICS */}
                {activeTab === 'mnemonics' && (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-purple-500" />
                      Memory Hooks & Mnemonics
                    </div>
                    {summaryData.mnemonics && summaryData.mnemonics.length > 0 ? (
                      summaryData.mnemonics.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2"
                        >
                          <div className="text-base font-bold text-purple-900 tracking-wide">
                            "{m.phrase}"
                          </div>
                          <div className="text-xs text-slate-700">
                            <strong className="text-purple-800">Stands for: </strong>
                            {m.standsFor}
                          </div>
                          <div className="text-xs text-slate-600">
                            <strong className="text-slate-800">Where to apply: </strong>
                            {m.appliedTo}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No standard mnemonics required for this topic. Focus on the core equations.
                      </p>
                    )}
                  </div>
                )}

                {/* 5. FLASHCARDS */}
                {activeTab === 'flashcards' && summaryData.flashcards && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>
                        Card {currentCardIndex + 1} of {summaryData.flashcards.length}
                      </span>
                      <span>
                        {Object.values(knownCards).filter(Boolean).length} / {summaryData.flashcards.length} Mastered
                      </span>
                    </div>

                    {summaryData.flashcards[currentCardIndex] && (
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className={`min-h-[220px] p-6 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all select-none shadow-sm ${
                          isFlipped
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-900 border-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isFlipped ? 'bg-white/20 text-indigo-200' : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {isFlipped ? 'Answer' : 'Question (Click to flip)'}
                          </span>
                          <RotateCw
                            className={`w-4 h-4 ${isFlipped ? 'text-slate-400' : 'text-slate-400'}`}
                          />
                        </div>

                        <div className="py-6 text-center">
                          <p
                            className={`text-base md:text-lg font-bold leading-snug ${
                              isFlipped ? 'text-indigo-100' : 'text-slate-900'
                            }`}
                          >
                            {isFlipped
                              ? summaryData.flashcards[currentCardIndex].answer
                              : summaryData.flashcards[currentCardIndex].question}
                          </p>
                          {!isFlipped && summaryData.flashcards[currentCardIndex].hint && (
                            <p className="text-xs text-slate-400 mt-2">
                              Hint: {summaryData.flashcards[currentCardIndex].hint}
                            </p>
                          )}
                        </div>

                        <div className="text-[11px] text-center text-slate-400">
                          {isFlipped ? 'Click to flip back' : 'Tap to reveal answer'}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={currentCardIndex === 0}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setKnownCards((prev) => ({ ...prev, [currentCardIndex]: false }));
                            if (currentCardIndex < summaryData.flashcards.length - 1) {
                              setIsFlipped(false);
                              setCurrentCardIndex((prev) => prev + 1);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        >
                          Review Again
                        </button>
                        <button
                          onClick={() => {
                            setKnownCards((prev) => ({ ...prev, [currentCardIndex]: true }));
                            if (currentCardIndex < summaryData.flashcards.length - 1) {
                              setIsFlipped(false);
                              setCurrentCardIndex((prev) => prev + 1);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        >
                          I Know This ✓
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex((prev) =>
                            Math.min(summaryData.flashcards.length - 1, prev + 1)
                          );
                        }}
                        disabled={currentCardIndex === summaryData.flashcards.length - 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
