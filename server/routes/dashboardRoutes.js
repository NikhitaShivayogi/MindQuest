const express = require('express');
const {
  getAssessmentById,
  getDashboardStats,
  getPerformanceData,
  getAllAssessments,
  deleteAssessment,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/performance', authMiddleware, getPerformanceData);
router.get('/:assessmentId', authMiddleware, getAssessmentById);
router.get('/', authMiddleware, getAllAssessments);
router.delete('/:assessmentId', authMiddleware, deleteAssessment);

module.exports = router;
