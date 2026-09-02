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

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

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
    console.warn('GEMINI_API_KEY missing; using local fallback quiz generation.');
    return generateFallbackQuiz(topic, language, numberOfQuestions, difficulty);
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
      console.warn('Gemini returned an invalid response; using local fallback quiz generation.');
      return generateFallbackQuiz(topic, language, numberOfQuestions, difficulty);
    }

    const normalizedQuestions = quizData.questions.slice(0, numberOfQuestions).map((q) => ({
      question: String(q.question || '').trim(),
      options: (Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D']).slice(0, 4),
      correctAnswer: String(q.correctAnswer || '').trim(),
      explanation: String(q.explanation || '').trim(),
    }));

    if (normalizedQuestions.length < numberOfQuestions) {
      console.warn('Gemini returned an incomplete quiz; using local fallback quiz generation.');
      return generateFallbackQuiz(topic, language, numberOfQuestions, difficulty);
    }

    return { ...quizData, questions: normalizedQuestions };
  } catch (error) {
    console.error('Error generating quiz:', error.message, error.status ? `(status ${error.status})` : '');
    if (attempt < maxAttempts) {
      try {
        return generateQuiz(topic, language, numberOfQuestions, difficulty, mode, attempt + 1);
      } catch (e) {
        console.warn('Gemini AI unavailable; using local fallback quiz generation.');
        return generateFallbackQuiz(topic, language, numberOfQuestions, difficulty);
      }
    }
    console.warn('Gemini AI unavailable; using local fallback quiz generation.');
    return generateFallbackQuiz(topic, language, numberOfQuestions, difficulty);
  }
};

const generateFallbackQuiz = (topic, language, numberOfQuestions, difficulty) => {
  const safeTopic = String(topic || 'General Knowledge').trim() || 'General Knowledge';
  const safeDifficulty = ['Easy', 'Medium', 'Hard', 'Expert'].includes(difficulty) ? difficulty : 'Medium';

  const questions = [];
  for (let i = 0; i < Math.max(1, Number(numberOfQuestions) || 10); i++) {
    const aliases = [
      'Core concept',
      'Primary idea',
      'Best explanation',
      'Correct principle',
      'Most accurate statement',
    ];
    const optionA = `${safeTopic} concept ${i + 1}: foundational understanding`;
    const optionB = `${safeTopic} concept ${i + 1}: common misconception`;
    const optionC = `${safeTopic} concept ${i + 1}: advanced application`;
    const optionD = `${safeTopic} concept ${i + 1}: unrelated explanation`;

    questions.push({
      question: `${safeTopic} — Question ${i + 1} (${safeDifficulty}) — Which option best reflects the ${aliases[i % aliases.length].toLowerCase()}?`,
      options: [optionA, optionB, optionC, optionD],
      correctAnswer: optionA,
      explanation: `This is the best answer because it matches the core understanding of ${safeTopic} at a ${safeDifficulty.toLowerCase()} level. The other options are either misconceptions or less directly relevant details.`,
    });
  }
  return {
    title: `${safeTopic} Quiz — ${safeDifficulty}`,
    topic: safeTopic,
    language,
    difficulty: safeDifficulty,
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
