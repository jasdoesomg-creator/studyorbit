/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubjectType, StudySessionRecord, StudyStreakData } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'studyorbit_study_sessions_v2',
  STREAK_CACHE: 'studyorbit_study_streak_v2',
};

const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Seed a realistic initial history if the student is new,
 * so they start with a motivating active streak.
 */
const getInitialSeedSessions = (): StudySessionRecord[] => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 2);

  return [
    {
      id: 'seed-sess-1',
      type: 'quiz',
      subject: 'Maths',
      title: 'Chain, Product, & Quotient Rules Quiz',
      date: getLocalDateStr(yesterday),
      timestamp: yesterday.getTime(),
      details: 'Score: 4/5 (80%)',
    },
    {
      id: 'seed-sess-2',
      type: 'note',
      subject: 'Physics',
      title: "Newton's Laws & SUVAT Equations Notes",
      date: getLocalDateStr(dayBefore),
      timestamp: dayBefore.getTime(),
      details: 'Extracted key points & cheat sheet',
    },
  ];
};

export const getStoredSessions = (): StudySessionRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading study sessions from storage', e);
  }

  // Seed default motivating sessions
  const seed = getInitialSeedSessions();
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(seed));
  } catch (e) {
    // ignore
  }
  return seed;
};

/**
 * Calculate the streak metrics from recorded study sessions.
 */
export const calculateStudyStreak = (sessions: StudySessionRecord[]): StudyStreakData => {
  const todayStr = getLocalDateStr(new Date());

  // Collect set of unique active dates
  const activeDateSet = new Set<string>();
  sessions.forEach((s) => {
    if (s.date) activeDateSet.add(s.date);
  });

  const hasStudiedToday = activeDateSet.has(todayStr);

  // Compute consecutive streak working backward
  let currentStreak = 0;
  const cursor = new Date();

  // If user hasn't studied today yet, check yesterday to see if streak is still active
  if (!hasStudiedToday) {
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayStr = getLocalDateStr(cursor);
    if (!activeDateSet.has(yesterdayStr)) {
      currentStreak = 0;
    } else {
      // Yesterday has activity; count backward from yesterday
      while (activeDateSet.has(getLocalDateStr(cursor))) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  } else {
    // User has studied today; count backward from today
    while (activeDateSet.has(getLocalDateStr(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Compute longest historical streak
  let longestStreak = currentStreak;
  try {
    const cachedRaw = localStorage.getItem(STORAGE_KEYS.STREAK_CACHE);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (typeof cached?.longestStreak === 'number') {
        longestStreak = Math.max(cached.longestStreak, currentStreak);
      }
    }
  } catch (e) {
    // ignore
  }
  longestStreak = Math.max(longestStreak, currentStreak, 2);

  // Find last studied date
  let lastStudiedDate: string | null = null;
  if (sessions.length > 0) {
    const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
    lastStudiedDate = sorted[0].date;
  }

  // Last 7 days overview (including today)
  const recentDays = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateStr(d);
    recentDays.push({
      date: dateStr,
      dayLabel: i === 0 ? 'Today' : dayLabels[d.getDay()],
      isToday: i === 0,
      hasStudied: activeDateSet.has(dateStr),
    });
  }

  const streakData: StudyStreakData = {
    currentStreak,
    longestStreak,
    lastStudiedDate,
    hasStudiedToday,
    totalSessions: sessions.length,
    recentDays,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STREAK_CACHE, JSON.stringify(streakData));
  } catch (e) {
    // ignore
  }

  return streakData;
};

export const getStudyStreakData = (): StudyStreakData => {
  const sessions = getStoredSessions();
  return calculateStudyStreak(sessions);
};

/**
 * Record a new completed quiz or note session and recalculate streak.
 * Dispatches an event so all UI components update reactively.
 */
export const recordStudySession = (
  type: 'quiz' | 'note',
  subject: SubjectType,
  title: string,
  details?: string
): StudyStreakData => {
  const todayStr = getLocalDateStr(new Date());
  const now = Date.now();

  const newSession: StudySessionRecord = {
    id: `sess-${now}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    subject,
    title,
    date: todayStr,
    timestamp: now,
    details,
  };

  const existing = getStoredSessions();
  const updated = [newSession, ...existing].slice(0, 100);

  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving study session', e);
  }

  const newStreakData = calculateStudyStreak(updated);

  // Notify listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('studyorbit:study_activity', {
        detail: { session: newSession, streak: newStreakData },
      })
    );
  }

  return newStreakData;
};
