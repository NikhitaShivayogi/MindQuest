const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  generateQuizForUser,
  submitAnswer,
  completeAssessment,
  getAssessment,
} = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const validateGenerate = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('numberOfQuestions').optional().isInt({ min: 1 }).withMessage('Questions must be a valid positive number'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard', 'Expert']).withMessage('Invalid difficulty level'),
  body('mode').optional().isIn(['Text']).withMessage('Invalid mode'),
  body('feedbackMode').optional().isIn(['Instant', 'After Completion']).withMessage('Invalid feedback mode'),
];

const validateSubmitAnswer = [
  body('assessmentId').notEmpty().withMessage('Assessment ID is required'),
  body('questionIndex').isInt({ min: 0 }).withMessage('Invalid question index'),
  body('userAnswer').trim().notEmpty().withMessage('Answer is required'),
];

router.post('/generate', authMiddleware, validateGenerate, generateQuizForUser);
router.post('/evaluate', authMiddleware, validateSubmitAnswer, submitAnswer);
router.post('/complete/:assessmentId', authMiddleware, completeAssessment);
router.get('/:assessmentId', authMiddleware, getAssessment);

module.exports = router;
