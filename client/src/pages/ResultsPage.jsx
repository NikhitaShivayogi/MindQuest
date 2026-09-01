import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BrainCircuit,
  Target,
  BarChart3,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { quizAPI } from '../services/api';
import { Spinner, EmptyState } from '../components/SharedUI';
import { ScoreRing, PageTransition, FadeIn, CountUp } from '../components/Animated';

const ResultsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await quizAPI.getAssessment(assessmentId);
        const assessment = response.data.assessment;
        const correct = assessment.answers.filter((a) => a.isCorrect).length;
        const incorrect = assessment.answers.filter((a) => !a.isCorrect).length;
        const percentage = assessment.percentage || Math.round((correct / assessment.numberOfQuestions) * 100);

        setResult({
          topic: assessment.topic,
          percentage,
          correct,
          incorrect,
          total: assessment.numberOfQuestions,
          timeTaken: assessment.timeTaken || 0,
          answers: assessment.answers,
          title: assessment.topic,
          difficulty: assessment.difficulty,
          language: assessment.language,
        });
      } catch (error) {
        console.error('Result fetch error', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="loading-wrap">
        <div className="loading-card">
          <Spinner />
          <div>
            <div className="font-semibold text-base text-[var(--text)]">Calculating your results…</div>
            <div className="text-[var(--text-muted)] text-xs mt-0.5">Synthesizing score and feedback</div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-24 text-center">
        <div className="container-x max-w-md mx-auto">
          <EmptyState
            title="No Results Found"
            description="We could not find assessment data for this session."
            action={
              <button className="btn-primary" onClick={() => navigate('/quiz-setup')}>
                <Sparkles size={16} /> Start a New Quest
              </button>
            }
            icon={Target}
          />
        </div>
      </div>
    );
  }

  const scoreTone = (() => {
    if (result.percentage >= 80) return { color: 'var(--success)', label: 'Outstanding Mastery!' };
    if (result.percentage >= 60) return { color: 'var(--warning)', label: 'Great Effort!' };
    return { color: 'var(--danger)', label: 'Keep Practicing!' };
  })();

  const chartData = [
    { name: 'Correct', value: result.correct, fill: 'var(--success)' },
    { name: 'Incorrect', value: result.incorrect, fill: 'var(--danger)' },
    { name: 'Unanswered', value: Math.max(result.total - result.correct - result.incorrect, 0), fill: 'var(--line)' },
  ];

  const barData = [
    { name: 'Accuracy', value: result.percentage },
    { name: 'Correct', value: result.correct },
    { name: 'Total', value: result.total },
  ];

  const formatTime = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;

  const aiInsight = (() => {
    if (result.percentage >= 85) return 'Exceptional performance. Your grasp of the fundamental concepts in this topic is thorough — consider stretching your limits with Hard or Expert difficulty.';
    if (result.percentage >= 70) return 'Strong showing. You answered the core questions well. Review the missed explanations below to patch any remaining conceptual gaps.';
    if (result.percentage >= 50) return 'Good foundational knowledge. With a quick review of the explanations below and a second attempt, you will easily push into mastery.';
    return 'This topic needs a bit more attention. We recommend carefully reading each question explanation and trying again with foundational mode.';
  })();

  const perQuestion = result.total > 0 ? Math.round(result.timeTaken / result.total) : 0;

  const customTooltipStyle = {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-card)',
    color: 'var(--text)',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 12px',
  };

  return (
    <PageTransition>
      <div className="py-10 md:py-14">
        <div className="container-lg max-w-4xl">
          {/* Header */}
          <FadeIn delay={0.05} direction="down">
            <div className="text-center mb-8">
              <span className="hero-kicker mb-3 inline-flex">
                <Trophy size={13} className="text-[var(--primary)]" /> Quest Complete
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--text)]">
                {scoreTone.label}
              </h1>
              <p className="text-sm md:text-base text-[var(--text-muted)] mt-1.5">
                Topic: <strong className="text-[var(--text)]">{result.topic}</strong>
              </p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="badge-pill badge-brand">
                  <Target size={11} /> {result.difficulty}
                </span>
                <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                  <BrainCircuit size={11} className="text-[var(--primary)]" /> {result.language}
                </span>
                <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                  <BarChart3 size={11} className="text-[var(--primary)]" /> {result.total} Questions
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Hero Score & Performance Card */}
          <FadeIn delay={0.15}>
            <div className="glass-effect p-6 md:p-8 rounded-3xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Score Ring */}
                <div className="flex flex-col items-center justify-center py-2">
                  <ScoreRing score={result.percentage} size={170} stroke={12} />
                  <div className="mt-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Final Score
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="md:col-span-2 grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <CheckCircle2 size={15} className="text-[var(--success)]" /> {t('correct')}
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--text)] mt-1">
                      {result.correct} <span className="text-xs text-[var(--text-muted)] font-normal">/ {result.total}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <XCircle size={15} className="text-[var(--danger)]" /> Missed
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--text)] mt-1">
                      {result.incorrect} <span className="text-xs text-[var(--text-muted)] font-normal">/ {result.total}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Clock size={15} className="text-[var(--primary)]" /> Duration
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--text)] mt-1">
                      {formatTime(result.timeTaken)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Sparkles size={15} className="text-[var(--secondary)]" /> Avg. / Q
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--text)] mt-1">
                      {perQuestion}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* AI Insights & Visual Charts */}
          <FadeIn delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* AI Feedback Insight */}
              <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--text)]">Gemini AI Feedback</h2>
                    <span className="badge-pill badge-brand">
                      <Sparkles size={11} /> AI Analysis
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--primary-soft)] border border-[color-mix(in_srgb,var(--primary)_25%,transparent)] text-xs md:text-sm text-[var(--text-soft)] leading-relaxed mb-4">
                    {aiInsight}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                    <span className="text-[var(--text-muted)] block">Focus Next</span>
                    <span className="font-semibold text-[var(--text)]">Concept Review</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                    <span className="text-[var(--text-muted)] block">Pacing</span>
                    <span className="font-semibold text-[var(--success)]">Steady & Focused</span>
                  </div>
                </div>
              </div>

              {/* Accuracy Chart */}
              <div className="glass-effect p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--text)]">Accuracy Breakdown</h2>
                  <span className="badge-pill badge-success">
                    <BarChart3 size={11} /> Distribution
                  </span>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={4}
                        stroke="var(--panel)"
                        strokeWidth={2}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={customTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Question-by-Question Review */}
          <FadeIn delay={0.35}>
            <div className="glass-effect p-6 rounded-2xl mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--text)]">Question Review</h2>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {result.correct}/{result.total} answered correctly
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {result.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border text-xs md:text-sm ${
                      answer.isCorrect
                        ? 'bg-[var(--success-soft)] border-[color-mix(in_srgb,var(--success)_25%,transparent)]'
                        : 'bg-[var(--danger-soft)] border-[color-mix(in_srgb,var(--danger)_25%,transparent)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 font-bold">
                        {answer.isCorrect ? (
                          <CheckCircle2 size={16} className="text-[var(--success)]" />
                        ) : (
                          <XCircle size={16} className="text-[var(--danger)]" />
                        )}
                        <span>Question {index + 1}</span>
                      </div>
                      <span
                        className={`badge-pill ${
                          answer.isCorrect ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {answer.isCorrect ? 'Correct' : 'Missed'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--text-soft)]">
                      <p>
                        <strong>Your answer:</strong>{' '}
                        {answer.userAnswer || <span className="italic text-[var(--text-muted)]">(none)</span>}
                      </p>
                      {answer.feedback && (
                        <p className="leading-relaxed">
                          💡 <strong>Feedback:</strong> {answer.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Bottom Action CTAs */}
          <FadeIn delay={0.45}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                className="btn-primary btn-lg"
                onClick={() => navigate('/quiz-setup')}
              >
                <Sparkles size={17} /> Start a New Quest
              </button>
              <button
                className="btn-secondary btn-lg"
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 size={17} /> Go to Dashboard
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResultsPage;
