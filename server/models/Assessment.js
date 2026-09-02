const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium',
    },
    numberOfQuestions: {
      type: Number,
      default: 10,
    },
    mode: {
      type: String,
      enum: ['Text'],
      default: 'Text',
    },
    feedbackMode: {
      type: String,
      enum: ['Instant', 'After Completion'],
      default: 'Instant',
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String,
      },
    ],
    answers: [
      {
        questionIndex: Number,
        userAnswer: String,
        isCorrect: Boolean,
        isSkipped: Boolean,
        feedback: String,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Abandoned'],
      default: 'In Progress',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
