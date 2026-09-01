import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (name, email, password, confirmPassword) =>
    api.post('/auth/register', { name, email, password, confirmPassword }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me'),
  getProfile: () =>
    api.get('/auth/profile'),
  updateProfile: (profileData) =>
    api.put('/auth/profile', profileData),
};

// Quiz API
export const quizAPI = {
  generateQuiz: (topic, language, numberOfQuestions, difficulty, mode) =>
    api.post('/quiz/generate', { topic, language, numberOfQuestions, difficulty, mode }),
  submitAnswer: (assessmentId, questionIndex, userAnswer) =>
    api.post('/quiz/evaluate', { assessmentId, questionIndex, userAnswer }),
  completeAssessment: (assessmentId) =>
    api.post(`/quiz/complete/${assessmentId}`),
  getAssessment: (assessmentId) =>
    api.get(`/assessments/${assessmentId}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),
  getPerformance: (limit = 10) =>
    api.get(`/dashboard/performance?limit=${limit}`),
  getAllAssessments: (page = 1, limit = 10) =>
    api.get(`/assessments?page=${page}&limit=${limit}`),
  deleteAssessment: (assessmentId) =>
    api.delete(`/assessments/${assessmentId}`),
};

export default api;
