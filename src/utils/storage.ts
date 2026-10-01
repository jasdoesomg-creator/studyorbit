import { ExamProfile, QuizAttemptRecord, SubjectSyllabus, SubjectType } from '../types';
import { DEFAULT_SYLLABUS } from '../data/defaultSyllabus';

const STORAGE_KEYS = {
  EXAM_PROFILE: 'studyorbit_exam_profile_v1',
  SYLLABUS_PREFIX: 'studyorbit_syllabus_v1_',
  QUIZ_HISTORY: 'studyorbit_quiz_history_v1',
  SAVED_SUMMARIES: 'studyorbit_saved_summaries_v1',
};

export const getSavedExamProfile = (): ExamProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading exam profile', e);
  }
  // Default: student has upcoming exam in 14 days
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14);

  return {
    hasExam: true,
    examName: 'Midterm STEM Board Examinations',
    examDate: targetDate.toISOString().split('T')[0],
    targetScore: '90%+',
    dailyStudyHours: 3,
  };
};

export const saveExamProfile = (profile: ExamProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAM_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving exam profile', e);
  }
};

export const getSubjectSyllabus = (subject: SubjectType): SubjectSyllabus => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SYLLABUS_PREFIX}${subject}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading syllabus for ${subject}`, e);
  }
  return DEFAULT_SYLLABUS[subject];
};

export const getAllSubjectSyllabuses = (): Record<SubjectType, SubjectSyllabus> => {
  return {
    Maths: getSubjectSyllabus('Maths'),
    Physics: getSubjectSyllabus('Physics'),
    Chemistry: getSubjectSyllabus('Chemistry'),
    Biology: getSubjectSyllabus('Biology'),
  };
};

export const saveSubjectSyllabus = (syllabus: SubjectSyllabus) => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SYLLABUS_PREFIX}${syllabus.subject}`, JSON.stringify(syllabus));
  } catch (e) {
    console.error(`Error saving syllabus for ${syllabus.subject}`, e);
  }
};

export const resetSubjectSyllabus = (subject: SubjectType): SubjectSyllabus => {
  const defaultData = DEFAULT_SYLLABUS[subject];
  saveSubjectSyllabus(defaultData);
  return defaultData;
};

export const getQuizHistory = (): QuizAttemptRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading quiz history', e);
  }
  return [];
};

export const saveQuizAttempt = (record: QuizAttemptRecord) => {
  try {
    const history = getQuizHistory();
    const updated = [record, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving quiz attempt', e);
  }
};

export const calculateDaysRemaining = (examDateStr: string): number => {
  if (!examDateStr) return 0;
  const exam = new Date(examDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  const diffTime = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
