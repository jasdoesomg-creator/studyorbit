import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper clean JSON parser
  function safeParseJson<T>(rawText: string, fallback: T): T {
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse Gemini JSON output:', e, rawText);
      return fallback;
    }
  }

  // 1. Endpoint: Summarize notes into easy points, formulas, mnemonics, traps
  app.post('/api/summarize-notes', async (req, res) => {
    try {
      const {
        subject = 'Maths',
        topic,
        rawNotes,
        hasExam = true,
        examDaysLeft = 7,
        level = 'High School / Pre-University',
      } = req.body;

      if (!rawNotes && !topic) {
        return res.status(400).json({ error: 'Please provide notes text or a topic to summarize.' });
      }

      const activeTopic = topic && topic.trim().length > 0 ? topic.trim() : 'Core Topic (Inferred from Notes)';

      const examContext = hasExam
        ? `The student is preparing for an upcoming examination (approx. ${examDaysLeft ?? 7} days away). Prioritize high-yield exam takeaways, key equations/laws, high-frequency examiner traps, and quick recall points.`
        : `The student is conducting standard course review. Prioritize foundational concept clarity and simplified step-by-step explanations.`;

      const prompt = `You are an expert STEM educator in ${subject}.
The user has provided student notes for ${subject}. Summarize and simplify these notes into a concise, high-yield study sheet specifically designed for examination preparation.

SUBJECT: ${subject}
TOPIC / TITLE: ${activeTopic}
EXAM CONTEXT: ${examContext}

RAW STUDENT NOTES:
"""
${rawNotes && rawNotes.trim().length > 0 ? rawNotes : `Core curriculum syllabus for ${subject}: ${activeTopic}`}
"""

CRITICAL INSTRUCTIONS:
1. Output a concise summary with key points and easy-to-understand explanations suitable for exam preparation.
2. Break down complex concepts into bite-sized, crystal-clear points that eliminate confusion.
3. If this is ${subject}, extract all crucial formulas, reaction mechanisms, definitions, or laws with units and conditions.
4. Highlight common traps and pitfalls where students frequently lose marks in exams.
5. Create flashcards for rapid active recall.

Return strict JSON only matching this schema:
{
  "title": "Concise topic title",
  "summaryOverview": "2-3 sentence clear, high-yield overview summarizing the core ideas for quick exam prep",
  "easyPoints": [
    {
      "point": "Key point headline (short & punchy)",
      "explanation": "Easy-to-understand explanation in 1-2 plain sentences with practical clarity"
    }
  ],
  "cheatSheetFormulas": [
    {
      "formula": "Equation, law, or symbolic rule",
      "meaning": "What this equation calculates or governs",
      "unitsOrConditions": "Key units, constants, or boundary conditions"
    }
  ],
  "mnemonics": [
    {
      "phrase": "Memory hook or mnemonic acronym",
      "standsFor": "What it stands for",
      "appliedTo": "Where to use this on an exam"
    }
  ],
  "commonTraps": [
    {
      "mistake": "Common trap or blunder students make",
      "whyItHappens": "Why students slip up under exam conditions",
      "howToAvoid": "Exact rule or mental checkpoint to avoid losing marks"
    }
  ],
  "flashcards": [
    {
      "question": "Direct exam question or recall prompt",
      "answer": "Accurate, concise ideal answer",
      "hint": "Subtle memory clue"
    }
  ]
}

Provide 4-7 easyPoints, 2-5 cheatSheetFormulas, 1-3 mnemonics, 2-4 commonTraps, and 4-6 flashcards. Return JSON only.`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = safeParseJson(response.text || '', null);
        if (parsed) {
          return res.json(parsed);
        }
      }

      // Fallback mock if AI key not provided or parsing failed
      return res.json({
        title: `${topic} - High-Yield Review`,
        summaryOverview: `A clear, exam-oriented breakdown of ${topic} in ${subject}, structured for rapid recall and zero confusion.`,
        easyPoints: [
          {
            point: `Core Principle of ${topic}`,
            explanation: `Understand the fundamental mechanism before attempting complex problem sets.`,
          },
          {
            point: 'Standard Problem Framework',
            explanation: `Identify given values, write down the applicable formula, check unit consistency, and solve systematically.`,
          },
          {
            point: 'Key Invariants',
            explanation: `Keep track of quantities that are conserved or hold constant under standard conditions.`,
          },
        ],
        cheatSheetFormulas: [
          {
            formula: subject === 'Maths' ? 'dy/dx = lim(h->0) [f(x+h) - f(x)] / h' : 'Fundamental Equation',
            meaning: `Defines primary relation for ${topic}`,
            unitsOrConditions: 'Standard SI Units',
          },
        ],
        mnemonics: [
          {
            phrase: 'P-E-M-D-A-S / Core Rule',
            standsFor: 'Prioritize operations systematically',
            appliedTo: 'Calculation steps and multi-part questions',
          },
        ],
        commonTraps: [
          {
            mistake: 'Skipping unit conversion before calculation',
            whyItHappens: 'Rushing through questions under exam pressure',
            howToAvoid: 'Highlight all units in the question stem before plugging in numbers',
          },
        ],
        flashcards: [
          {
            question: `What is the primary definition of ${topic}?`,
            answer: `It describes the fundamental behavior and rules governing this domain in ${subject}.`,
            hint: 'Recall the first key point above.',
          },
        ],
      });
    } catch (error: any) {
      console.error('Error summarizing notes:', error);
      res.status(500).json({ error: error.message || 'Failed to process notes summary.' });
    }
  });

  // 2. Endpoint: Generate Quiz / Test
  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const {
        subject,
        topic,
        questionCount = 5,
        difficulty = 'medium',
        hasExam = false,
        examDaysLeft = 7,
      } = req.body;

      const urgencyContext = hasExam
        ? `The student is preparing for an actual exam in ${examDaysLeft} days. Include authentic test-style questions with high discriminant value, common distractors in choices, and detailed explanations.`
        : `The student is doing regular diagnostic practice to reinforce understanding and test retention.`;

      const prompt = `You are a test preparation specialist creating a realistic diagnostic quiz for a student in ${subject}.
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${questionCount}
Context: ${urgencyContext}

Generate a quiz with ${questionCount} multiple-choice questions. Each question must have:
- A clear, unambiguous question stem
- 4 plausible options (labeled in an array of 4 items)
- correctIndex (0, 1, 2, or 3)
- inDepthExplanation (explains why the correct option is right AND why the distractors are wrong)
- examTip (a quick takeaway rule for exam day)

Return strict JSON only matching:
{
  "quizTitle": "${subject} Diagnostic: ${topic}",
  "estimatedMinutes": ${Math.max(5, Math.round(questionCount * 1.5))},
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "inDepthExplanation": "Detailed rationale here...",
      "examTip": "Key takeaway...",
      "difficulty": "${difficulty}"
    }
  ]
}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const parsed = safeParseJson<any>(response.text || '', null);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return res.json(parsed);
        }
      }

      // Fallback questions if AI is not configured
      const fallbackQuestions = [
        {
          id: 'q1',
          question: `In ${subject} (${topic}), which of the following is considered the primary governing rule?`,
          options: [
            'Direct proportional conservation',
            'Independent variable isolation',
            'Equilibrium under closed system parameters',
            'Empirical baseline approximation',
          ],
          correctIndex: 2,
          inDepthExplanation: `In standard physical and mathematical systems, equilibrium conditions define the baseline state from which perturbations are analyzed.`,
          examTip: 'Always verify whether the system boundary is open or closed before setting up equations.',
          difficulty,
        },
        {
          id: 'q2',
          question: `When applying fundamental formulas in ${topic}, which common pitfall must be checked first?`,
          options: [
            'Consistent SI units across all terms',
            'Alphabetical order of symbols',
            'Rounding intermediate numbers to one digit',
            'Ignoring boundary constraints',
          ],
          correctIndex: 0,
          inDepthExplanation: `Unit mismatches (such as mixing cm with meters or grams with kilograms) are the single most common cause of lost marks in STEM examinations.`,
          examTip: 'Write down units next to each variable before carrying out algebraic manipulation.',
          difficulty,
        },
      ];

      return res.json({
        quizTitle: `${subject} Quiz: ${topic}`,
        estimatedMinutes: 5,
        questions: fallbackQuestions,
      });
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      res.status(500).json({ error: error.message || 'Failed to generate quiz.' });
    }
  });

  // 3. Endpoint: Parse Custom Syllabus text
  app.post('/api/parse-syllabus', async (req, res) => {
    try {
      const { subject, rawSyllabusText } = req.body;
      if (!rawSyllabusText || rawSyllabusText.trim().length === 0) {
        return res.status(400).json({ error: 'Syllabus text is required.' });
      }

      const prompt = `The student provided raw text of their course syllabus for ${subject}.
Parse this text into clean, structured modules/units and subtopics so the app can track their exam progress.

Syllabus Text:
"""
${rawSyllabusText}
"""

Return strict JSON only matching:
{
  "subject": "${subject}",
  "units": [
    {
      "id": "u1",
      "title": "Unit / Chapter Title",
      "weightage": "High" | "Medium" | "Low",
      "topics": [
        {
          "id": "t1",
          "title": "Specific Topic Name",
          "importance": "Core" | "Advanced" | "Foundational"
        }
      ]
    }
  ]
}
Extract realistic 3-8 units, each with 2-6 subtopics. Return JSON only.`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const parsed = safeParseJson<any>(response.text || '', null);
        if (parsed && Array.isArray(parsed.units)) {
          return res.json(parsed);
        }
      }

      // Simple heuristic fallback parser
      const lines = rawSyllabusText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      const units: any[] = [];
      let currentUnit: any = null;

      lines.forEach((line: string, idx: number) => {
        if (line.match(/^(unit|chapter|module|section|\d+[\.:])/i) || !currentUnit) {
          currentUnit = {
            id: `unit-${units.length + 1}`,
            title: line.replace(/^[\d\.\-\*#]+\s*/, ''),
            weightage: 'High',
            topics: [],
          };
          units.push(currentUnit);
        } else if (currentUnit) {
          currentUnit.topics.push({
            id: `topic-${units.length}-${currentUnit.topics.length + 1}`,
            title: line.replace(/^[\d\.\-\*#]+\s*/, ''),
            importance: 'Core',
          });
        }
      });

      return res.json({ subject, units: units.length > 0 ? units : [{ id: 'u1', title: 'General Syllabus', weightage: 'High', topics: [{ id: 't1', title: rawSyllabusText.slice(0, 40), importance: 'Core' }] }] });
    } catch (error: any) {
      console.error('Error parsing syllabus:', error);
      res.status(500).json({ error: error.message || 'Failed to parse syllabus.' });
    }
  });

  // 4. Endpoint: Study Plan Generator
  app.post('/api/study-plan', async (req, res) => {
    try {
      const { subjects, examDaysLeft, dailyHours = 3 } = req.body;

      const prompt = `A student has exams in ${examDaysLeft} days across Maths, Physics, Chemistry, and Biology.
They can dedicate ${dailyHours} hours per day.
Create a high-impact, realistic revision schedule that balances all four subjects, prioritizing high-yield concepts and active recall (practice questions over passive reading).

Return strict JSON only matching:
{
  "summary": "Encouraging strategic 1-2 sentence overview",
  "dailyTargetHours": ${dailyHours},
  "phases": [
    {
      "phaseName": "Phase name (e.g. Days 1-3: Core Consolidation)",
      "focus": "Key objective",
      "subjectAllocations": [
        { "subject": "Maths", "recommendedHours": 1, "priorityAction": "What to do" },
        { "subject": "Physics", "recommendedHours": 1, "priorityAction": "What to do" },
        { "subject": "Chemistry", "recommendedHours": 0.5, "priorityAction": "What to do" },
        { "subject": "Biology", "recommendedHours": 0.5, "priorityAction": "What to do" }
      ]
    }
  ],
  "topAdvice": [
    "Tip 1 for test success",
    "Tip 2 for test success",
    "Tip 3 for test success"
  ]
}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const parsed = safeParseJson(response.text || '', null);
        if (parsed) return res.json(parsed);
      }

      return res.json({
        summary: `Strategic study schedule tailored for ${examDaysLeft} days countdown.`,
        dailyTargetHours: dailyHours,
        phases: [
          {
            phaseName: `Days 1 to ${Math.max(1, Math.floor(examDaysLeft / 2))}: Core Formula & Concept Review`,
            focus: 'Solidify formulas in Maths & Physics; memorize reaction pathways and diagrams in Chemistry & Biology.',
            subjectAllocations: [
              { subject: 'Maths', recommendedHours: 1, priorityAction: 'Solve 10 calculus & algebra problems' },
              { subject: 'Physics', recommendedHours: 1, priorityAction: 'Review mechanics & kinematics laws' },
              { subject: 'Chemistry', recommendedHours: 0.5, priorityAction: 'Equilibrium & stoichiometry drills' },
              { subject: 'Biology', recommendedHours: 0.5, priorityAction: 'Cell division & genetics diagrams' },
            ],
          },
          {
            phaseName: `Final Days: Mock Tests & Common Traps`,
            focus: 'Timed quizzes and reviewing errors from previous practice tests.',
            subjectAllocations: [
              { subject: 'Maths', recommendedHours: 0.75, priorityAction: 'Timed past paper questions' },
              { subject: 'Physics', recommendedHours: 0.75, priorityAction: 'Formula recall without notes' },
              { subject: 'Chemistry', recommendedHours: 0.75, priorityAction: 'Acid-base & organic mechanisms' },
              { subject: 'Biology', recommendedHours: 0.75, priorityAction: 'Key terminology & physiological cycles' },
            ],
          },
        ],
        topAdvice: [
          'Do active problem solving: 70% solving quizzes, 30% reviewing notes.',
          'Review the Common Traps section for each topic before sleeping.',
          'Simulate test timing with the built-in timed quiz mode.',
        ],
      });
    } catch (error: any) {
      console.error('Error creating study plan:', error);
      res.status(500).json({ error: error.message || 'Failed to generate study plan.' });
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyOrbit server running on port ${PORT}`);
  });
}

startServer();
