import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  Sparkles,
  Gauge,
  Languages,
  Lightbulb,
  X,
} from 'lucide-react';
import api from '../services/api';
import { Spinner } from '../components/SharedUI';
import { PageTransition, FadeIn } from '../components/Animated';

const LETTERS = ['A', 'B', 'C', 'D'];

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const QuizPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [assessment, setAssessment] = useState(() => location.state?.assessment || null);
  const [loadingAssessment, setLoadingAssessment] = useState(!location.state?.assessment);
  const [startedAt, setStartedAt] = useState(() => location.state?.startedAt || Date.now());
  const [quizStarted, setQuizStarted] = useState(() => Boolean(location.state?.quizStarted));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState({});

  const [evaluating, setEvaluating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');
  const evaluatingRef = useRef(false);
  const pendingFinish = useRef(false);
  const completionRequested = useRef(false);

  const [timeSeconds, setTimeSeconds] = useState(() => {
    const total = location.state?.assessment?.numberOfQuestions || 10;
    return Math.max(90, total * 30);
  });
  const [timerActive, setTimerActive] = useState(() => Boolean(location.state?.quizStarted));

  const assessmentQuestions = assessment?.questions || [];
  const questionCount = assessmentQuestions.length;
  const isInstantFeedback = assessment?.feedbackMode === 'Instant';

  const currentQuestion = assessmentQuestions[currentIndex];
  const currentEvaluation = evaluations[currentIndex];
  const isLast = currentIndex === questionCount - 1;
  const isAnswered = typeof evaluations[currentIndex] !== 'undefined';

  useEffect(() => {
    if (!assessmentId || assessment || !loadingAssessment) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/quiz/${assessmentId}`);
        if (mounted && res.data?.assessment) {
          setAssessment(res.data.assessment);
          setTimeSeconds(Math.max(90, (res.data.assessment.numberOfQuestions || 10) * 30));
        }
      } catch (err) {
        if (mounted) setError('Could not load this quest. Please start a new one.');
      } finally {
        if (mounted) setLoadingAssessment(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [assessmentId, assessment, loadingAssessment]);

  useEffect(() => {
    if (!timerActive || timeSeconds <= 0 || submitting) return;
    const id = setInterval(() => {
      setTimeSeconds((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleFinish(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, submitting]);

  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);

  const submitAnswer = async (optionIndex) => {
    if (evaluating || isAnswered || !assessment) return;
    const optionText = optionIndex === null
      ? ''
      : String(currentQuestion.options[optionIndex]).trim();
    evaluatingRef.current = true;
    setEvaluating(true);
    setError('');
    try {
      const res = await api.post('/quiz/evaluate', {
        assessmentId: assessment._id || assessment.id,
        questionIndex: currentIndex,
        userAnswer: optionText,
        timeTaken: elapsedSeconds,
      });
      const ev = res.data?.evaluation || {};
      setEvaluations((prev) => ({ ...prev, [currentIndex]: { ...ev, selectedOption: optionIndex } }));
      setAnswers((prev) => {
        const next = prev.filter((a) => a.questionIndex !== currentIndex);
        return [...next, { questionIndex: currentIndex, userAnswer: optionText, evaluation: ev }];
      });
      if (isInstantFeedback) {
        setShowFeedback(true);
      } else {
        setShowFeedback(false);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not evaluate your answer.';
      setError(msg);
    } finally {
      evaluatingRef.current = false;
      setEvaluating(false);
      if (pendingFinish.current) {
        pendingFinish.current = false;
        handleFinish(true);
      }
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setShowHint(false);
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
  };

  const prevQuestion = () => {
    setShowFeedback(false);
    setShowHint(false);
    if (currentIndex <= 0) return;
    setCurrentIndex((i) => i - 1);
    const prev = evaluations[currentIndex - 1];
    setSelectedOption(typeof prev?.selectedOption === 'number' ? prev.selectedOption : null);
    if (prev && isInstantFeedback) setShowFeedback(true);
  };

  const handleFinish = async (timedOut = false) => {
    if (submitting || completionRequested.current || !assessment) return;
    if (evaluatingRef.current) {
      pendingFinish.current = true;
      setTimerActive(false);
      return;
    }
    completionRequested.current = true;
    setSubmitting(true);
    setTimerActive(false);
    try {
      const id = assessment._id || assessment.id || assessmentId;
      const res = await api.post(`/quiz/complete/${id}`, {
        timeTaken: elapsedSeconds,
      });
      navigate(`/results/${id}`, {
        state: { result: res.data?.result, timedOut },
        replace: true,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not finish your quest. Please try again.');
      completionRequested.current = false;
      setSubmitting(false);
      setTimerActive(true);
    }
  };

  const startQuiz = () => {
    setStartedAt(Date.now());
    setQuizStarted(true);
    setTimerActive(true);
  };

  const answeredCount = Object.keys(evaluations).length;
  const progressPct = questionCount > 0 ? (answeredCount / questionCount) * 100 : 0;
  const correctCount = Object.values(evaluations).filter((e) => !!e.isCorrect).length;
  const timeUrgent = timeSeconds <= 60;

  if (loadingAssessment && !assessment) {
    return (
      <div className="loading-wrap">
        <div className="loading-card">
          <Spinner />
          <div>
            <div className="font-semibold text-base text-[var(--text)]">Loading your quest…</div>
            <div className="text-[var(--text-muted)] text-xs mt-0.5">Fetching AI generated questions</div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="py-24 text-center">
        <div className="container-x max-w-md mx-auto">
          <div className="glass-effect p-8 rounded-2xl">
            <AlertCircle size={32} className="text-[var(--danger)] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[var(--text)]">Quest Not Found</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1.5 mb-6">
              This session may have expired or does not exist.
            </p>
            <button className="btn-primary w-full" onClick={() => navigate('/quiz-setup')}>
              <Sparkles size={16} /> Start a New Quest
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <PageTransition>
        <div className="py-10 md:py-16 min-h-[calc(100vh-4.25rem)] flex items-center justify-center">
          <div className="container-x max-w-2xl">
            <div className="wizard-card">
              <div className="text-center mb-7">
                <span className="hero-kicker mb-3 inline-flex">
                  <Sparkles size={13} className="text-[var(--primary)]" /> Ready to Play
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
                  {assessment.topic}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Read the rules before starting your knowledge quest.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-center">
                  <div className="text-2xl font-extrabold text-[var(--primary)]">{questionCount}</div>
                  <div className="text-xs font-semibold text-[var(--text-muted)]">Questions</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-center">
                  <div className="text-2xl font-extrabold text-[var(--success)]">{questionCount}</div>
                  <div className="text-xs font-semibold text-[var(--text-muted)]">Max points</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-center">
                  <div className="text-2xl font-extrabold text-[var(--warning)]">{Math.max(90, questionCount * 30)}s</div>
                  <div className="text-xs font-semibold text-[var(--text-muted)]">Time limit</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-center">
                  <div className="text-2xl font-extrabold text-[var(--danger)]">0</div>
                  <div className="text-xs font-semibold text-[var(--text-muted)]">Skipped points</div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--text-soft)] space-y-2.5">
                <p><strong>Scoring:</strong> Each correct answer earns 1 point. Your maximum score is {questionCount} points.</p>
                <p><strong>Skipping:</strong> You can skip any question, but skipped questions earn 0 points.</p>
                <p><strong>Wrong answers:</strong> Wrong answers also earn 0 points. There is no penalty.</p>
                <p><strong>Results:</strong> Your points, correct answers, missed questions, and skipped questions appear when the quest ends.</p>
              </div>

              <button type="button" className="btn-primary w-full mt-6" onClick={startQuiz}>
                <Sparkles size={16} /> Start Quiz
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="py-6 md:py-10">
        <div className="container-lg max-w-3xl">
          {/* Top Bar Navigation */}
          <FadeIn delay={0.05} direction="down">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={14} /> Exit Quest
              </button>

              <div className="flex items-center gap-2">
                <span className="badge-pill badge-brand truncate max-w-[160px]">
                  <Brain size={12} /> {assessment.topic}
                </span>
                <span className="badge-pill badge-warning">
                  <Gauge size={12} /> {assessment.difficulty}
                </span>
                <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                  <Languages size={12} className="text-[var(--primary)]" /> {assessment.language}
                </span>
              </div>

              <div className={`timer-box ${timeUrgent ? 'urgent' : ''}`}>
                <Clock size={14} />
                {formatTime(timeSeconds)}
              </div>
            </div>
          </FadeIn>

          {/* Progress Tracker */}
          <FadeIn delay={0.1}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex-1">
                <div className="progress-bar-wrap">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
              </div>
              <div className="text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap">
                {answeredCount}/{questionCount} answered · {correctCount}/{questionCount} points
              </div>
            </div>
          </FadeIn>

          {error && (
            <div className="error-box mb-5">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">{error}</div>
              <button onClick={() => setError('')} className="opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Question Card */}
          <FadeIn delay={0.15}>
            <div className="quiz-card p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white text-xs font-extrabold grid place-items-center">
                        {currentIndex + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Question {currentIndex + 1} of {questionCount}
                      </span>
                    </div>

                  </div>

                  <h2 className="quiz-question mb-6">
                    {currentQuestion?.question}
                  </h2>

                  {/* Options */}
                  <div className="flex flex-col gap-3 mb-5">
                    {currentQuestion?.options.map((opt, i) => {
                      const userPicked = selectedOption === i;
                      let state = '';
                      if (isAnswered && isInstantFeedback) {
                        const correctAns = currentQuestion.correctAnswer;
                        const optText = String(opt).trim();
                        const correctText = String(correctAns).trim();
                        const isCorrect = optText === correctText;
                        const userPickedThis = evaluations[currentIndex]?.selectedOption === i;
                        if (isCorrect) state = 'correct';
                        else if (userPickedThis && !isCorrect) state = 'incorrect';
                      } else if (userPicked) {
                        state = 'selected';
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isAnswered || evaluating}
                          onClick={() => {
                            if (isAnswered || evaluating) return;
                            setSelectedOption(i);
                          }}
                          className={`quiz-option ${state}`}
                        >
                          <span className="quiz-option-label">{LETTERS[i]}</span>
                          <span className="flex-1 leading-snug">{String(opt)}</span>
                          {state === 'correct' && (
                            <CheckCircle2 size={18} className="text-[var(--success)] flex-shrink-0" />
                          )}
                          {state === 'incorrect' && (
                            <XCircle size={18} className="text-[var(--danger)] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Box */}
                  {!isInstantFeedback && !showFeedback && isAnswered && (
                    <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--text-muted)] mb-4">
                      Answer saved. Feedback will be shown when the full quest is finished.
                    </div>
                  )}

                  {isInstantFeedback && showFeedback && currentEvaluation && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border mb-4 text-sm ${
                        currentEvaluation.isSkipped
                          ? 'bg-[var(--surface)] border-[var(--line)]'
                          : currentEvaluation.isCorrect
                          ? 'bg-[var(--success-soft)] border-[color-mix(in_srgb,var(--success)_30%,transparent)]'
                          : 'bg-[var(--danger-soft)] border-[color-mix(in_srgb,var(--danger)_30%,transparent)]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {currentEvaluation.isSkipped ? (
                          <Clock size={18} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                        ) : currentEvaluation.isCorrect ? (
                          <CheckCircle2 size={18} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={18} className="text-[var(--danger)] flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-bold text-sm text-[var(--text)] mb-1">
                            {currentEvaluation.isSkipped
                              ? 'Unanswered'
                              : currentEvaluation.isCorrect
                                ? 'Correct!'
                                : 'Incorrect'}
                          </div>
                          <p className="text-[var(--text-soft)] leading-relaxed text-xs md:text-sm">
                            {currentEvaluation.feedback}
                          </p>
                          {currentQuestion.explanation && (
                            <p className="text-xs text-[var(--text-soft)] mt-2 font-medium">
                              💡 <strong>Explanation:</strong> {currentQuestion.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Hint Toggle */}
                  {isInstantFeedback && !showFeedback && !showHint && !isAnswered && (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] inline-flex items-center gap-1 mb-2"
                    >
                      <Lightbulb size={13} /> Need a hint?
                    </button>
                  )}
                  {showHint && !isAnswered && currentQuestion?.explanation && (
                    <div className="p-3 rounded-xl bg-[var(--warning-soft)] border border-[color-mix(in_srgb,var(--warning)_30%,transparent)] text-xs text-[var(--text-soft)] mb-3">
                      <strong className="text-[var(--warning)]">💡 Hint:</strong>{' '}
                      {String(currentQuestion.explanation).split('. ')[0]}.
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Assessment Navigation Buttons */}
              <div className="mt-6 pt-5 border-t border-[var(--line)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {isAnswered ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={isLast ? () => handleFinish(false) : nextQuestion}
                    disabled={submitting}
                  >
                    {isLast ? (submitting ? 'Finishing…' : 'Finish Quest') : 'Next Question'}
                    {!isLast && <ArrowRight size={16} />}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => submitAnswer(null)}
                      disabled={evaluating}
                    >
                      Skip Question
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => submitAnswer(selectedOption)}
                      disabled={selectedOption === null || evaluating}
                    >
                      {evaluating ? (
                        <>
                          <div className="spinner spinner-sm" /> Evaluating…
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default QuizPage;
