const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-gemini-key') {
  console.warn('⚠️  GEMINI_API_KEY is not properly configured. AI features will use fallback mode.');
}

const genAI = GEMINI_API_KEY && GEMINI_API_KEY !== 'demo-gemini-key'
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

const GEMINI_MODEL = 'gemini-3.6-flash';

const failWithoutFallback = (message) => {
  const error = new Error(message);
  error.code = 'GEMINI_UNAVAILABLE';
  throw error;
};

const extractJson = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .replace(/^\s*```.*```\s*$/s, '')
    .trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  let candidate = null;
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidate = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket >= 0 && lastBracket > firstBracket) {
    candidate = cleaned.substring(firstBracket, lastBracket + 1);
  }
  if (!candidate) candidate = cleaned;
  try {
    return JSON.parse(candidate);
  } catch (e) {
    try {
      candidate = candidate
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ': "$1"');
      return JSON.parse(candidate);
    } catch (e2) {
      return null;
    }
  }
};

const generateQuiz = async (topic, language, numberOfQuestions, difficulty, mode, attempt = 1) => {
  const maxAttempts = 2;

  if (!genAI) {
    failWithoutFallback('Gemini API is not configured. Please add a valid GEMINI_API_KEY.');
  }

  try {
    const difficultyDescriptions = {
      Easy: 'basic and straightforward questions that test foundational knowledge',
      Medium: 'moderately challenging questions with some depth and nuance',
      Hard: 'challenging questions requiring good comprehension and critical thinking',
      Expert: 'very difficult advanced questions requiring expert-level mastery',
    };

    const prompt = `You are an expert quiz creator. Generate a high-quality quiz JSON response.

TOPIC: "${topic}"
LANGUAGE: ${language} (All content MUST be in ${language})
QUESTIONS: Exactly ${numberOfQuestions} questions
DIFFICULTY: ${difficultyDescriptions[difficulty] || 'moderate'}
FORMAT: well-structured multiple choice questions

REQUIREMENTS:
- Generate EXACTLY ${numberOfQuestions} multiple-choice questions
- Each question must have exactly 4 distinct options
- Exactly ONE correct answer per question (must match one of the 4 options exactly)
- Include a concise, educational explanation (2-3 sentences) for why the answer is correct
- Questions should be varied in style and not repeat the same pattern
- All questions, options, and explanations must be written entirely in ${language}
- Content must be accurate, factual, and appropriate for the given difficulty
- For ${difficulty} difficulty: avoid trick questions but test real understanding

Return ONLY a valid JSON object in this exact format. No markdown. No commentary. No code fences. No surrounding text:

{
  "title": "${topic} Quiz — ${difficulty}",
  "topic": "${topic}",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Full question text here in ${language}?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Exact text of the correct option",
      "explanation": "Brief educational explanation in ${language} about why it's correct"
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textContent = response.text();
    const quizData = extractJson(textContent);

    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      if (attempt < maxAttempts) {
        return generateQuiz(topic, language, numberOfQuestions, difficulty, mode, attempt + 1);
      }
      failWithoutFallback('Gemini returned an invalid response. No quiz was generated.');
    }

    const normalizedQuestions = quizData.questions.slice(0, numberOfQuestions).map((q) => ({
      question: String(q.question || '').trim(),
      options: (Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D']).slice(0, 4),
      correctAnswer: String(q.correctAnswer || '').trim(),
      explanation: String(q.explanation || '').trim(),
    }));

    if (normalizedQuestions.length < numberOfQuestions) {
      failWithoutFallback('Gemini returned an incomplete quiz. Real user data could not be generated.');
    }

    return { ...quizData, questions: normalizedQuestions };
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    if (attempt < maxAttempts) {
      try {
        return generateQuiz(topic, language, numberOfQuestions, difficulty, mode, attempt + 1);
      } catch (e) {
        failWithoutFallback('Gemini AI is temporarily unavailable. Please try again in a moment.');
      }
    }
    failWithoutFallback('Gemini AI is temporarily unavailable. Please try again in a moment.');
  }
};

const generateFallbackQuiz = (topic, language, numberOfQuestions, difficulty) => {
  const questions = [];
  for (let i = 0; i < numberOfQuestions; i++) {
    questions.push({
      question: `${topic} — Question ${i + 1} (${difficulty})`,
      options: [
        `Answer A for Q${i + 1}`,
        `Answer B for Q${i + 1}`,
        `Answer C for Q${i + 1}`,
        `Answer D for Q${i + 1}`,
      ],
      correctAnswer: `Answer A for Q${i + 1}`,
      explanation: `Demo explanation for Q${i + 1}. Connect your Gemini API key for real AI-generated content.`,
    });
  }
  return {
    title: `${topic} Quiz — ${difficulty}`,
    topic,
    language,
    difficulty,
    questions,
  };
};

const localEvaluateAnswer = (userAnswer, correctAnswer) => {
  const normalizedCorrect = String(correctAnswer || '').trim().toLowerCase();
  const normalizedUser = String(userAnswer || '').trim().toLowerCase();

  const exactMatch = normalizedUser === normalizedCorrect;
  const containsCorrect = normalizedCorrect.length > 5 && normalizedUser.includes(normalizedCorrect);
  const correctContainsUser = normalizedUser.length > 5 && normalizedCorrect.includes(normalizedUser);
  const commonWordMatch = normalizedUser.length > 2 && normalizedCorrect.length > 2 &&
    normalizedUser.split(/\s+/).filter(Boolean).some((word) => word.length > 2 && normalizedCorrect.includes(word));

  if (exactMatch || containsCorrect || correctContainsUser || commonWordMatch) {
    return {
      isCorrect: true,
      confidence: 0.96,
      feedback: 'That is the correct answer. Well done!',
      score: 100,
      usedLocalFallback: true,
    };
  }

  const isLikelyWrong = normalizedUser.length > 0 && normalizedUser !== normalizedCorrect;
  return {
    isCorrect: false,
    confidence: 0.58,
    feedback: `Not quite. The correct answer is: ${correctAnswer}.`,
    score: 0,
    usedLocalFallback: true,
  };
};

const evaluateAnswer = async (question, userAnswer, correctAnswer, language, attempt = 1) => {
  const localResult = localEvaluateAnswer(userAnswer, correctAnswer);

  if (localResult.isCorrect || localResult.score === 0) {
    const normalizedUser = String(userAnswer || '').trim().toLowerCase();
    const normalizedCorrect = String(correctAnswer || '').trim().toLowerCase();
    const isVeryClear = normalizedUser === normalizedCorrect ||
      normalizedUser.includes(normalizedCorrect) ||
      normalizedCorrect.includes(normalizedUser);

    if (isVeryClear) {
      return localResult;
    }
  }

  try {
    if (!genAI) {
      return localResult;
    }

    const prompt = `You are an expert answer evaluator for a quiz in ${language}.

QUESTION: "${question}"
CORRECT ANSWER: "${correctAnswer}"
USER ANSWER: "${userAnswer}"

Evaluate the user's answer semantically, not just by literal string match. Consider:
- Is the user's meaning equivalent or sufficiently close?
- Score 100 for fully correct answers.
- Score 50-75 for partially correct answers that show understanding but miss key detail.
- Score 0 for clearly incorrect answers.

Return ONLY a valid JSON object in this exact format. No markdown. No commentary. No code fences:

{
  "isCorrect": true or false,
  "confidence": 0.0 to 1.0,
  "feedback": "Concise, encouraging feedback in ${language}. If wrong, state the correct answer clearly.",
  "score": 0 to 100
}`;

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const evaluation = extractJson(response.text());

    if (!evaluation || typeof evaluation.isCorrect === 'undefined') {
      if (attempt < 2) {
        return evaluateAnswer(question, userAnswer, correctAnswer, language, attempt + 1);
      }
      return localResult;
    }

    if (typeof evaluation.score !== 'number') {
      evaluation.score = evaluation.isCorrect ? 100 : 0;
    }
    if (typeof evaluation.confidence !== 'number') {
      evaluation.confidence = 0.7;
    }
    if (!evaluation.feedback) {
      evaluation.feedback = localResult.feedback;
    }

    return evaluation;
  } catch (error) {
    console.error('Error evaluating answer:', error.message);
    return localResult;
  }
};

module.exports = {
  generateQuiz,
  evaluateAnswer,
};
