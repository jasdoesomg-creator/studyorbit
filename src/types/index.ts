export type SubjectType = 'Maths' | 'Physics' | 'Chemistry' | 'Biology';

export type TopicStatus = 'not_started' | 'in_progress' | 'mastered' | 'review_needed';

export interface SyllabusTopic {
  id: string;
  title: string;
  importance: 'Core' | 'Advanced' | 'Foundational';
  status: TopicStatus;
  sampleNotes?: string;
  studentNotes?: string;
  lastReviewed?: string;
}

export interface SyllabusUnit {
  id: string;
  title: string;
  weightage: 'High' | 'Medium' | 'Low';
  topics: SyllabusTopic[];
}

export interface SubjectSyllabus {
  subject: SubjectType;
  units: SyllabusUnit[];
}

export interface ExamProfile {
  hasExam: boolean;
  examName: string;
  examDate: string; // YYYY-MM-DD
  targetScore: string;
  dailyStudyHours: number;
}

export interface EasyPoint {
  point: string;
  explanation: string;
}

export interface CheatSheetFormula {
  formula: string;
  meaning: string;
  unitsOrConditions?: string;
}

export interface Mnemonic {
  phrase: string;
  standsFor: string;
  appliedTo: string;
}

export interface CommonTrap {
  mistake: string;
  whyItHappens: string;
  howToAvoid: string;
}

export interface Flashcard {
  question: string;
  answer: string;
  hint?: string;
}

export interface NotesSummary {
  title: string;
  summaryOverview: string;
  easyPoints: EasyPoint[];
  cheatSheetFormulas: CheatSheetFormula[];
  mnemonics: Mnemonic[];
  commonTraps: CommonTrap[];
  flashcards: Flashcard[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  inDepthExplanation: string;
  examTip: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizTest {
  quizTitle: string;
  estimatedMinutes: number;
  questions: QuizQuestion[];
}

export interface QuizAttemptRecord {
  id: string;
  subject: SubjectType;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
}

export interface StudyPlanPhase {
  phaseName: string;
  focus: string;
  subjectAllocations: {
    subject: SubjectType;
    recommendedHours: number;
    priorityAction: string;
  }[];
}

export interface StudyPlanResponse {
  summary: string;
  dailyTargetHours: number;
  phases: StudyPlanPhase[];
  topAdvice: string[];
}

export interface StudySessionRecord {
  id: string;
  type: 'quiz' | 'note';
  subject: SubjectType;
  title: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  details?: string;
}

export interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudiedDate: string | null;
  hasStudiedToday: boolean;
  totalSessions: number;
  recentDays: {
    date: string;
    dayLabel: string;
    isToday: boolean;
    hasStudied: boolean;
  }[];
}

