import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  SubjectType,
  SyllabusTopic,
  SubjectSyllabus,
  QuizQuestion,
  QuizTest,
  QuizAttemptRecord,
  ExamProfile,
} from '../types';
import {
  CheckSquare,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  FileText,
  Calendar,
  History,
} from 'lucide-react';
import { getQuizHistory, saveQuizAttempt } from '../utils/storage';
import { recordStudySession } from '../utils/streak';

interface QuizArenaViewProps {
  activeSubject: SubjectType;
  syllabus: SubjectSyllabus;
  initialTopic?: SyllabusTopic | null;
  examProfile: ExamProfile;
  daysRemaining: number;
  onNavigateToNotes: (topicTitle: string) => void;
}

export const QuizArenaView: React.FC<QuizArenaViewProps> = ({
  activeSubject,
  syllabus,
  initialTopic,
  examProfile,
  daysRemaining,
  onNavigateToNotes,
}) => {
  const allTopics = syllabus.units.flatMap((u) => u.topics);

  // Configuration state
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopic?.id || (allTopics.length > 0 ? allTopics[0].id : 'all')
  );
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isTimed, setIsTimed] = useState<boolean>(true);

  // Active quiz state
  const [quizState, setQuizState] = useState<'idle' | 'loading' | 'running' | 'completed'>('idle');
  const [currentQuiz, setCurrentQuiz] = useState<QuizTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>([]);
  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    setQuizHistory(getQuizHistory());
  }, []);

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopicId(initialTopic.id);
    }
  }, [initialTopic]);

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'running' || !isTimed) return;

    if (secondsRemaining <= 0) {
      handleFinishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, isTimed, secondsRemaining]);

  const selectedTopic = allTopics.find((t) => t.id === selectedTopicId);
  const currentTopicName = selectedTopic ? selectedTopic.title : `${activeSubject} Comprehensive`;

  const handleStartQuiz = async () => {
    setQuizState('loading');
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeSubject,
          topic: currentTopicName,
          questionCount,
          difficulty,
          hasExam: examProfile.hasExam,
          examDaysLeft: daysRemaining,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate quiz');
      const data: QuizTest = await res.json();

      setCurrentQuiz(data);
      setSecondsRemaining((data.estimatedMinutes || questionCount * 1.5) * 60);
      setQuizState('running');
    } catch (err: any) {
      console.error(err);
      setQuizState('idle');
      setQuizError('Unable to generate quiz at this moment. Please try again.');
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (!currentQuiz) return;
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    if (!currentQuiz) return;
    setQuizState('completed');

    // Calculate score
    let correctCount = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / currentQuiz.questions.length) * 100);

    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }

    const record: QuizAttemptRecord = {
      id: `attempt-${Date.now()}`,
      subject: activeSubject,
      topic: currentTopicName,
      score: correctCount,
      totalQuestions: currentQuiz.questions.length,
      percentage,
      date: new Date().toLocaleDateString(),
    };

    saveQuizAttempt(record);
    setQuizHistory(getQuizHistory());

    // Record study session to build and maintain the user's daily study streak
    recordStudySession(
      'quiz',
      activeSubject,
      `${currentTopicName} Diagnostic Quiz`,
      `Score: ${correctCount}/${currentQuiz.questions.length} (${percentage}%)`
    );
  };

  // Score computation
  const calculateScore = () => {
    if (!currentQuiz) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correct++;
    });
    return {
      correct,
      total: currentQuiz.questions.length,
      percentage: Math.round((correct / currentQuiz.questions.length) * 100),
    };
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                Examination Arena
              </span>
              <span className="text-xs text-slate-500">
                {activeSubject} Diagnostic Testing
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Exam Simulation & Diagnostic Quizzes
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Conduct timed tests to check retention, identify knowledge gaps, and get step-by-step reasoning for every choice.
            </p>
          </div>

          {examProfile.hasExam && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                <strong>{daysRemaining} Days to Exam:</strong> Questions include realistic test distractors.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* State 1: Configuration / Launch */}
      {quizState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              Configure Test Parameters
            </h2>

            {/* Topic Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic or Unit
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">🌟 Comprehensive ({activeSubject} Full Syllabus)</option>
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.importance})
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      questionCount === cnt
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cnt} Questions {cnt === 5 ? '(Quick Pop)' : cnt === 10 ? '(Full Practice)' : '(Intensive)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      difficulty === diff
                        ? diff === 'easy'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : diff === 'medium'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Timed Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-semibold text-slate-900 block">Timed Exam Simulation</span>
                <span className="text-xs text-slate-500">
                  Simulates realistic countdown pressure ({Math.round(questionCount * 1.5)} mins).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimed(!isTimed)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isTimed ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isTimed ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {quizError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{quizError}</span>
              </div>
            )}

            {/* Launch Button */}
            <button
              onClick={handleStartQuiz}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Begin {currentTopicName} Test ({questionCount} Questions)
            </button>
          </div>

          {/* Past History Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              Recent Practice Attempts
            </h2>

            {quizHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No past attempts yet. Complete your first test to track accuracy!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {quizHistory
                  .filter((h) => h.subject === activeSubject)
                  .map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {attempt.topic}
                        </div>
                        <span className="text-slate-500 text-[11px]">{attempt.date}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            attempt.percentage >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : attempt.percentage >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {attempt.percentage}% ({attempt.score}/{attempt.totalQuestions})
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* State 2: Loading Quiz */}
      {quizState === 'loading' && (
        <div className="bg-white rounded-2xl p-16 border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-3 border-amber-500 border-t-transparent animate-spin mb-4" />
          <h2 className="text-lg font-bold text-slate-900">Crafting Your Exam Questions...</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Generating authentic questions for <span className="font-semibold text-slate-800">{currentTopicName}</span>{' '}
            with plausible distractors and detailed step-by-step rationales.
          </p>
        </div>
      )}

      {/* State 3: Quiz In-Progress */}
      {quizState === 'running' && currentQuiz && currentQuiz.questions[currentQuestionIndex] && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Top Progress & Timer Bar */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-amber-300">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                {currentTopicName}
              </span>
            </div>

            {isTimed && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                  secondsRemaining < 60
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white/10 text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {formatTimer(secondsRemaining)}
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-slate-100 h-1.5">
            <div
              className="bg-indigo-600 h-1.5 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Difficulty: {currentQuiz.questions[currentQuestionIndex].difficulty}
              </span>
              <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                {currentQuiz.questions[currentQuestionIndex].question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuiz.questions[currentQuestionIndex].options.map((option, optIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs md:text-sm font-medium text-slate-800 leading-relaxed pt-0.5">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
              >
                Previous Question
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={userAnswers[currentQuestionIndex] === undefined}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-2xs"
              >
                {currentQuestionIndex === currentQuiz.questions.length - 1
                  ? 'Submit & Finish Test'
                  : 'Next Question →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 4: Results & In-Depth Review */}
      {quizState === 'completed' && currentQuiz && (
        <div className="space-y-6">
          {/* Results Summary Card */}
          {(() => {
            const { correct, total, percentage } = calculateScore();
            const isHighPass = percentage >= 80;
            const isPass = percentage >= 60;

            return (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                    isHighPass
                      ? 'bg-emerald-100 text-emerald-600'
                      : isPass
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  <Trophy className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Test Completed
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {percentage}% ({correct} / {total} Correct)
                  </h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
                    {isHighPass
                      ? `Outstanding performance! You have strong conceptual mastery of ${currentTopicName}.`
                      : isPass
                      ? `Good effort. Review the specific questions missed below to eliminate exam traps.`
                      : `Needs reinforcement. We recommend reviewing the Easy Points revision sheet for ${currentTopicName}.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleStartQuiz}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake This Test
                  </button>
                  <button
                    onClick={() => onNavigateToNotes(currentTopicName)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Revise Easy Points for {currentTopicName}
                  </button>
                  <button
                    onClick={() => setQuizState('idle')}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Configure Another Test
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Detailed Question Review */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step-by-Step Question Breakdown & Explanations
            </h3>

            <div className="space-y-6">
              {currentQuiz.questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border space-y-3.5 ${
                      isCorrect ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 bg-slate-900 text-white mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{q.question}</h4>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    {/* Options summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isUserSelected = userChoice === optIdx;
                        const isRightAnswer = q.correctIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isRightAnswer
                                ? 'bg-emerald-100/70 border-emerald-300 font-semibold text-emerald-950'
                                : isUserSelected
                                ? 'bg-rose-100/70 border-rose-300 font-semibold text-rose-950'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </span>
                            {isRightAnswer && (
                              <span className="text-[10px] text-emerald-800 font-bold uppercase">
                                Correct Answer
                              </span>
                            )}
                            {isUserSelected && !isRightAnswer && (
                              <span className="text-[10px] text-rose-800 font-bold uppercase">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* In-depth explanation & exam tip */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-800">Explanation: </strong>
                        <span className="text-slate-600 leading-relaxed">
                          {q.inDepthExplanation}
                        </span>
                      </div>
                      {q.examTip && (
                        <div className="pt-1 text-indigo-700 flex items-center gap-1.5 font-medium">
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>
                            <strong>Exam Tip:</strong> {q.examTip}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
