const Assessment = require('../models/Assessment');
const { generateQuiz, evaluateAnswer } = require('../services/geminiService');

const generateQuizForUser = async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { topic, language, numberOfQuestions, difficulty, mode, feedbackMode } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Please enter a topic to begin your quest' });
    }

    const numQs = Number.isFinite(Number(numberOfQuestions)) && Number(numberOfQuestions) > 0
      ? Math.max(1, Math.floor(Number(numberOfQuestions)))
      : 10;

    let quizData;
    try {
      quizData = await generateQuiz(
        topic.trim(),
        language || 'English',
        numQs,
        difficulty || 'Medium',
        mode || 'Text'
      );
    } catch (error) {
      console.error('Quiz generation blocked:', error.message);
      return res.status(503).json({
        message: 'AI quiz generation is temporarily unavailable. Please try again in a moment.',
      });
    }

    const assessment = new Assessment({
      userId: req.user.userId,
      topic: topic.trim(),
      language: language || 'English',
      difficulty: difficulty || 'Medium',
      numberOfQuestions: numQs,
      mode: mode || 'Text',
      feedbackMode: feedbackMode || 'Instant',
      questions: quizData.questions,
      status: 'In Progress',
    });

    await assessment.save();

    res.status(201).json({
      message: 'Quest generated successfully',
      assessment: {
        id: assessment._id,
        topic: assessment.topic,
        language: assessment.language,
        difficulty: assessment.difficulty,
        numberOfQuestions: assessment.numberOfQuestions,
        mode: assessment.mode,
        feedbackMode: assessment.feedbackMode,
        questions: assessment.questions,
        createdAt: assessment.createdAt,
      },
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Could not generate your quest. Please try again.' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { assessmentId, questionIndex, userAnswer, timeTaken } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (assessment.status !== 'In Progress') {
      return res.status(400).json({ message: 'This assessment has already been completed' });
    }

    const question = assessment.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    const existingAnswerIndex = assessment.answers.findIndex(
      (a) => a.questionIndex === questionIndex
    );

    const isSkipped = !String(userAnswer || '').trim();
    const evaluation = isSkipped
      ? {
          isCorrect: false,
          score: 0,
          confidence: 1,
          feedback: 'Question skipped. No answer was submitted.',
        }
      : await evaluateAnswer(
          question.question,
          userAnswer,
          question.correctAnswer,
          assessment.language
        );

    const answerRecord = {
      questionIndex,
      userAnswer: String(userAnswer || '').trim(),
      isCorrect: evaluation.isCorrect,
      isSkipped,
      feedback: evaluation.feedback,
      confidence: evaluation.confidence || 0.5,
      score: typeof evaluation.score === 'number' ? evaluation.score : (evaluation.isCorrect ? 100 : 0),
    };

    if (existingAnswerIndex >= 0) {
      assessment.answers[existingAnswerIndex] = answerRecord;
    } else {
      assessment.answers.push(answerRecord);
    }

    if (timeTaken && typeof timeTaken === 'number') {
      assessment.timeTaken = Math.max(assessment.timeTaken || 0, timeTaken);
    }

    await assessment.save();

    res.json({
      message: 'Answer submitted successfully',
      evaluation: {
        isCorrect: evaluation.isCorrect,
        isSkipped,
        feedback: evaluation.feedback,
        score: answerRecord.score,
        correctAnswer: question.correctAnswer,
      },
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Could not submit your answer. Please try again.' });
  }
};

const completeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { timeTaken } = req.body || {};

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let totalScore = 0;
    let correctAnswers = 0;
    let partialAnswers = 0;
    let incorrectAnswers = 0;
    let skippedAnswers = 0;

    assessment.answers.forEach((answer) => {
      const s = typeof answer.score === 'number' ? answer.score : (answer.isCorrect ? 100 : 0);
      const skipped = answer.isSkipped || !String(answer.userAnswer || '').trim();
      if (skipped) {
        skippedAnswers++;
        return;
      }
      totalScore += s;
      if (s >= 90) correctAnswers++;
      else if (s >= 40) partialAnswers++;
      else incorrectAnswers++;
    });

    const maxPossibleScore = assessment.numberOfQuestions * 100;
    const percentage = maxPossibleScore > 0
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

    assessment.status = 'Completed';
    assessment.score = totalScore;
    assessment.percentage = percentage;
    assessment.completedAt = new Date();

    if (timeTaken && typeof timeTaken === 'number') {
      assessment.timeTaken = Math.max(assessment.timeTaken || 0, timeTaken);
    } else if (assessment.createdAt) {
      const elapsed = Math.floor((Date.now() - new Date(assessment.createdAt).getTime()) / 1000);
      assessment.timeTaken = Math.max(assessment.timeTaken || 0, elapsed);
    }

    await assessment.save();

    res.json({
      message: 'Quest completed successfully',
      result: {
        id: assessment._id,
        score: assessment.score,
        percentage: assessment.percentage,
        correctAnswers,
        partialAnswers,
        incorrectAnswers,
        skippedAnswers,
        totalQuestions: assessment.numberOfQuestions,
        timeTaken: assessment.timeTaken,
        answers: assessment.answers,
        questions: assessment.questions,
        topic: assessment.topic,
        difficulty: assessment.difficulty,
        language: assessment.language,
        mode: assessment.mode,
        completedAt: assessment.completedAt,
      },
    });
  } catch (error) {
    console.error('Complete assessment error:', error);
    res.status(500).json({ message: 'Could not finalize your results. Please try again.' });
  }
};

const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Error fetching assessment' });
  }
};

module.exports = {
  generateQuizForUser,
  submitAnswer,
  completeAssessment,
  getAssessment,
};
