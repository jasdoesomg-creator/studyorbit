/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, MainTab } from './components/Navbar';
import { ExamBanner } from './components/ExamBanner';
import { ExamModal } from './components/ExamModal';
import { SyllabusView } from './components/SyllabusView';
import { NotesSimplifierView } from './components/NotesSimplifierView';
import { QuizArenaView } from './components/QuizArenaView';
import { StudyPlanView } from './components/StudyPlanView';
import {
  ExamProfile,
  SubjectSyllabus,
  SubjectType,
  SyllabusTopic,
} from './types';
import {
  getSavedExamProfile,
  saveExamProfile,
  getSubjectSyllabus,
  saveSubjectSyllabus,
  resetSubjectSyllabus,
  calculateDaysRemaining,
} from './utils/storage';

export default function App() {
  const [activeSubject, setActiveSubject] = useState<SubjectType>('Maths');
  const [activeTab, setActiveTab] = useState<MainTab>('syllabus');
  const [examProfile, setExamProfile] = useState<ExamProfile>(getSavedExamProfile);
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);

  // Syllabus state for active subject
  const [currentSyllabus, setCurrentSyllabus] = useState<SubjectSyllabus>(() =>
    getSubjectSyllabus(activeSubject)
  );

  // Cross-view topic passing
  const [topicForNotes, setTopicForNotes] = useState<SyllabusTopic | null>(null);
  const [topicForQuiz, setTopicForQuiz] = useState<SyllabusTopic | null>(null);

  // Sync syllabus when activeSubject changes
  useEffect(() => {
    setCurrentSyllabus(getSubjectSyllabus(activeSubject));
  }, [activeSubject]);

  const daysRemaining = calculateDaysRemaining(examProfile.examDate);

  const handleUpdateExamProfile = (updated: ExamProfile) => {
    setExamProfile(updated);
    saveExamProfile(updated);
  };

  const handleUpdateSyllabus = (updated: SubjectSyllabus) => {
    setCurrentSyllabus(updated);
    saveSubjectSyllabus(updated);
  };

  const handleResetSyllabus = () => {
    const reset = resetSubjectSyllabus(activeSubject);
    setCurrentSyllabus(reset);
  };

  const handleSelectTopicForNotes = (topic: SyllabusTopic) => {
    setTopicForNotes(topic);
    setActiveTab('notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopicForQuiz = (topic: SyllabusTopic) => {
    setTopicForQuiz(topic);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchQuizFromTitle = (topicTitle: string) => {
    const allTopics = currentSyllabus.units.flatMap((u) => u.topics);
    const found = allTopics.find((t) => t.title.toLowerCase() === topicTitle.toLowerCase());
    if (found) {
      setTopicForQuiz(found);
    } else {
      setTopicForQuiz({
        id: `custom-${Date.now()}`,
        title: topicTitle,
        importance: 'Core',
        status: 'in_progress',
      });
    }
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToNotesFromTitle = (topicTitle: string) => {
    const allTopics = currentSyllabus.units.flatMap((u) => u.topics);
    const found = allTopics.find((t) => t.title.toLowerCase() === topicTitle.toLowerCase());
    if (found) {
      setTopicForNotes(found);
    }
    setActiveTab('notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* 1. Exam Banner Notification (Shows whether exam is coming up or regular study) */}
      <ExamBanner
        profile={examProfile}
        onOpenSettings={() => setIsExamModalOpen(true)}
      />

      {/* 2. Top Navigation Bar (Logo, 4 Subjects pills, Sub-tabs) */}
      <Navbar
        activeSubject={activeSubject}
        onSelectSubject={setActiveSubject}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenExamModal={() => setIsExamModalOpen(true)}
        hasExam={examProfile.hasExam}
        daysRemaining={daysRemaining}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'syllabus' && (
          <SyllabusView
            syllabus={currentSyllabus}
            onUpdateSyllabus={handleUpdateSyllabus}
            onResetSyllabus={handleResetSyllabus}
            onSelectTopicForNotes={handleSelectTopicForNotes}
            onSelectTopicForQuiz={handleSelectTopicForQuiz}
          />
        )}

        {activeTab === 'notes' && (
          <NotesSimplifierView
            activeSubject={activeSubject}
            onSelectSubject={setActiveSubject}
            syllabus={currentSyllabus}
            initialTopic={topicForNotes}
            examProfile={examProfile}
            daysRemaining={daysRemaining}
            onLaunchQuizForTopic={handleLaunchQuizFromTitle}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizArenaView
            activeSubject={activeSubject}
            syllabus={currentSyllabus}
            initialTopic={topicForQuiz}
            examProfile={examProfile}
            daysRemaining={daysRemaining}
            onNavigateToNotes={handleNavigateToNotesFromTitle}
          />
        )}

        {activeTab === 'plan' && (
          <StudyPlanView
            examProfile={examProfile}
            daysRemaining={daysRemaining}
            onOpenExamModal={() => setIsExamModalOpen(true)}
            onSelectSubject={setActiveSubject}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>

      {/* 4. Exam Settings Dialog */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        profile={examProfile}
        onSave={handleUpdateExamProfile}
      />

      {/* 5. Minimalist Academic Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">StudyOrbit</span>
            <span>•</span>
            <span>Maths, Physics, Chemistry, Biology Revision Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Exam Settings ({examProfile.hasExam ? `${daysRemaining}d Left` : 'Steady Mode'})
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab('notes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-800 transition-colors"
            >
              Quick Notes Simplifier
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab('quiz');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-800 transition-colors"
            >
              Take Practice Quiz
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
