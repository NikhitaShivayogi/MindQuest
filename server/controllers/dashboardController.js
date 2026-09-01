const Assessment = require('../models/Assessment');

const getAssessmentById = async (req, res) => {
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
    console.error('Get assessment by id error:', error);
    res.status(500).json({ message: 'Error fetching assessment' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const assessments = await Assessment.find({
      userId,
      status: 'Completed',
    }).sort({ completedAt: -1 });

    const totalQuests = assessments.length;
    const averageScore =
      totalQuests > 0 ? Math.round(assessments.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalQuests) : 0;
    const bestScore = totalQuests > 0 ? Math.max(...assessments.map((a) => a.percentage || 0)) : 0;
    const totalQuestionsAnswered = assessments.reduce((sum, a) => sum + (a.numberOfQuestions || 0), 0);

    let currentStreak = 0;
    if (totalQuests > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uniqueDates = new Set();
      assessments.forEach((a) => {
        if (a.completedAt) {
          const d = new Date(a.completedAt);
          d.setHours(0, 0, 0, 0);
          uniqueDates.add(d.getTime());
        }
      });

      const sortedDates = Array.from(uniqueDates).sort((a, b) => b - a);
      let checkDate = new Date(today).getTime();
      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (sortedDates[0] === checkDate || sortedDates[0] === yesterday.getTime()) {
        if (sortedDates[0] !== checkDate) {
          checkDate = yesterday.getTime();
        }
        for (const dateMs of sortedDates) {
          if (dateMs === checkDate) {
            currentStreak++;
            const prev = new Date(checkDate);
            prev.setDate(prev.getDate() - 1);
            checkDate = prev.getTime();
          } else if (dateMs < checkDate) {
            break;
          }
        }
      }
    }

    res.json({
      stats: {
        totalQuests,
        averageScore,
        bestScore,
        totalQuestionsAnswered,
        currentStreak,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

const getPerformanceData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    const assessments = await Assessment.find({
      userId,
      status: 'Completed',
    })
      .sort({ completedAt: -1 })
      .limit(limit);

    const difficultyStats = {};
    ['Easy', 'Medium', 'Hard', 'Expert'].forEach((diff) => {
      const assessmentsForDifficulty = assessments.filter((a) => a.difficulty === diff);
      difficultyStats[diff] = {
        count: assessmentsForDifficulty.length,
        averageScore:
          assessmentsForDifficulty.length > 0
            ? Math.round(
                assessmentsForDifficulty.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                  assessmentsForDifficulty.length
              )
            : 0,
      };
    });

    const topicStats = {};
    assessments.forEach((assessment) => {
      const t = assessment.topic;
      if (!topicStats[t]) {
        topicStats[t] = {
          count: 0,
          averageScore: 0,
          scores: [],
          bestScore: 0,
        };
      }
      topicStats[t].count++;
      const pct = assessment.percentage || 0;
      topicStats[t].scores.push(pct);
      topicStats[t].bestScore = Math.max(topicStats[t].bestScore, pct);
    });

    Object.keys(topicStats).forEach((topic) => {
      topicStats[topic].averageScore = Math.round(
        topicStats[topic].scores.reduce((a, b) => a + b, 0) / topicStats[topic].scores.length
      );
      delete topicStats[topic].scores;
    });

    res.json({
      performance: {
        difficultyStats,
        topicStats,
        recentAssessments: assessments.map((a) => ({
          id: a._id,
          topic: a.topic,
          score: a.percentage || 0,
          difficulty: a.difficulty,
          language: a.language,
          date: a.completedAt || a.createdAt,
          numberOfQuestions: a.numberOfQuestions,
          timeTaken: a.timeTaken || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
};

const getAllAssessments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const assessments = await Assessment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Assessment.countDocuments({ userId });

    res.json({
      assessments: assessments.map((a) => ({
        id: a._id,
        topic: a.topic,
        score: a.percentage || 0,
        difficulty: a.difficulty,
        language: a.language,
        status: a.status,
        numberOfQuestions: a.numberOfQuestions,
        date: a.completedAt || a.createdAt,
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Get all assessments error:', error);
    res.status(500).json({ message: 'Error fetching assessments' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Assessment.findByIdAndDelete(assessmentId);

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Error deleting assessment' });
  }
};

module.exports = {
  getAssessmentById,
  getDashboardStats,
  getPerformanceData,
  getAllAssessments,
  deleteAssessment,
};
