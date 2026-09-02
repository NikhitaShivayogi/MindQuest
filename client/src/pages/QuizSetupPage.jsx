import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Hash,
  Gauge,
  Keyboard,
  Brain,
  AlertCircle,
  Clock,
  Languages,
} from 'lucide-react';
import api from '../services/api';
import { AIGenerationLoader } from '../components/SharedUI';
import { StepIndicator, PageTransition, FadeIn } from '../components/Animated';

const DIFFICULTIES = [
  {
    level: 'Easy',
    desc: 'Foundational concepts and direct questions.',
    icon: '🌱',
  },
  {
    level: 'Medium',
    desc: 'Balanced challenge for everyday learning.',
    icon: '📘',
    default: true,
  },
  {
    level: 'Hard',
    desc: 'Nuanced questions testing deeper conceptual understanding.',
    icon: '🔥',
  },
  {
    level: 'Expert',
    desc: 'Advanced problem-solving and rigorous edge-cases.',
    icon: '🏆',
  },
];

const FEEDBACK_MODES = [
  { mode: 'Instant', desc: 'Show feedback right after every answer.', default: true },
  { mode: 'After Completion', desc: 'Reveal feedback only when the full quiz is finished.' },
];

const LANGUAGES = [
  { name: 'English', native: 'English', icon: 'EN' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', icon: 'ಕ' },
  { name: 'Hindi', native: 'हिन्दी', icon: 'हि' },
  { name: 'Telugu', native: 'తెలుగు', icon: 'తె' },
  { name: 'Tamil', native: 'தமிழ்', icon: 'த' },
  { name: 'Malayalam', native: 'മലയാളം', icon: 'മ' },
  { name: 'Marathi', native: 'मराठी', icon: 'म' },
  { name: 'Bengali', native: 'বাংলা', icon: 'বাং' },
  { name: 'Gujarati', native: 'ગુજરાતી', icon: 'ગુ' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', icon: 'ਪੰ' },
  { name: 'Spanish', native: 'Español', icon: 'ES' },
  { name: 'French', native: 'Français', icon: 'FR' },
];

const SUGGESTED_TOPICS = [
  { topic: 'JavaScript & React Hooks', emoji: '⚛️' },
  { topic: 'World War II History', emoji: '🌍' },
  { topic: 'Organic Chemistry Basics', emoji: '🧪' },
  { topic: 'Microeconomics & Markets', emoji: '📈' },
  { topic: 'Solar System & Astronomy', emoji: '🚀' },
  { topic: 'Python Data Structures', emoji: '🐍' },
];

const TOTAL_STEPS = 5;

const QuizSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [mode] = useState('Text');
  const [feedbackMode, setFeedbackMode] = useState('Instant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stepMeta = [
    null,
    { title: 'What would you like to master?', sub: 'Type any subject or pick one of the popular topics below.' },
    { title: 'How many questions?', sub: 'Choose your quiz length from a quick knowledge check to a deep dive.' },
    { title: 'Select difficulty level', sub: 'Calibrate question depth to match your skill.' },
    { title: 'Choose quiz language', sub: 'Questions, options, explanations, and feedback will use this language.' },
    { title: 'Choose feedback timing', sub: 'See results immediately or wait until the entire quiz is complete.' },
  ][step];

  const canAdvance = (() => {
    if (step === 1) return topic.trim().length > 0;
    return true;
  })();

  const goNext = () => {
    if (!canAdvance && step === 1) {
      setError('Please enter a topic to continue');
      return;
    }
    setError('');
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const goBack = () => {
    setError('');
    if (step > 1) setStep((s) => s - 1);
  };

  const startQuest = async () => {
    setError('');
    const validCount = Number(questionCount);
    const safeQuestionCount = Number.isFinite(validCount) && validCount > 0 ? Math.floor(validCount) : 1;
    setQuestionCount(safeQuestionCount);
    setLoading(true);
    try {
      const res = await api.post('/quiz/generate', {
        topic: topic.trim(),
        numberOfQuestions: safeQuestionCount,
        difficulty,
        language,
        mode,
        feedbackMode,
      });
      const assessment = res.data?.assessment;
      if (!assessment) throw new Error('No assessment returned');
      navigate(`/quiz/${assessment.id}`, {
        state: {
          assessment,
          quizStarted: false,
        },
        replace: true,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not generate your quest. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="py-10 md:py-16 min-h-[calc(100vh-4.25rem)] flex items-center justify-center">
        <div className="container-x">
          <FadeIn delay={0.05} direction="down">
            <div className="text-center mb-8">
              <span className="hero-kicker mb-3 inline-flex">
                <Sparkles size={13} className="text-[var(--primary)]" /> Custom Quest Creator
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)]">
                Craft Your <span className="gradient-text">Personalized Quest</span>
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                Configure your topic, length, mode, and feedback style in 5 quick steps.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="max-w-2xl mx-auto">
              <StepIndicator current={step} total={TOTAL_STEPS} />

              <div className="wizard-card">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">
                        {stepMeta.title}
                      </h2>
                      <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">
                        {stepMeta.sub}
                      </p>
                    </div>

                    {error && (
                      <div className="error-box mb-5">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div>{error}</div>
                      </div>
                    )}

                    {step === 1 && (
                      <StepTopic
                        topic={topic}
                        setTopic={(v) => {
                          setTopic(v);
                          if (error) setError('');
                        }}
                      />
                    )}
                    {step === 2 && (
                      <StepCount value={questionCount} setValue={setQuestionCount} />
                    )}
                    {step === 3 && (
                      <StepDifficulty value={difficulty} setValue={setDifficulty} />
                    )}
                    {step === 4 && (
                      <StepLanguage value={language} setValue={setLanguage} />
                    )}
                    {step === 5 && (
                      <StepFeedbackMode value={feedbackMode} setValue={setFeedbackMode} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Wizard Controls */}
                <div className="mt-8 pt-6 border-t border-[var(--line)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={goBack}
                    disabled={step === 1 || loading}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={goNext}
                      disabled={!canAdvance || loading}
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={startQuest}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner spinner-sm" /> Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Generate My Quiz
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Summary bar */}
                <div className="mt-6 pt-4 border-t border-[var(--line)] flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                  <span className="font-semibold text-[var(--text-soft)]">Configuration:</span>
                  <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                    <Brain size={11} className="text-[var(--primary)]" /> {topic ? topic : 'No topic'}
                  </span>
                  <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                    <Hash size={11} className="text-[var(--primary)]" /> {questionCount} Qs
                  </span>
                  <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                    <Gauge size={11} className="text-[var(--primary)]" /> {difficulty}
                  </span>
                  <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                    <Languages size={11} className="text-[var(--primary)]" /> {language}
                  </span>
                  <span className="badge-pill bg-[var(--surface)] border border-[var(--line)]">
                    {feedbackMode}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <AIGenerationLoader
          open={loading}
          topic={topic}
          language={language}
          stages={[
            { stage: 'Analyzing topic & concepts', substage: `Topic: ${topic || 'Knowledge Quest'}` },
            { stage: 'Configuring quiz model', substage: 'Preparing a focused learning flow' },
            { stage: `Crafting ${questionCount} questions`, substage: `${difficulty} difficulty · ${mode} mode` },
            { stage: 'Validating answer accuracy', substage: 'Checking fact consistency & hints' },
            { stage: 'Ready to begin your quest', substage: 'Loading your assessment interface…' },
          ]}
        />
      </div>
    </PageTransition>
  );
};

const StepTopic = ({ topic, setTopic }) => (
  <div className="flex flex-col gap-5">
    <div className="relative">
      <Brain size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)] pointer-events-none" />
      <input
        autoFocus
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Type any topic… e.g. Quantum Computing, French Impressionism, Python"
        className="input-field text-base py-3 pl-11 pr-10 font-medium"
      />
      {topic && (
        <button
          type="button"
          onClick={() => setTopic('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] w-6 h-6 rounded-full bg-[var(--surface)] grid place-items-center"
        >
          ✕
        </button>
      )}
    </div>

    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
        Or pick a popular topic:
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TOPICS.map((s) => (
          <button
            key={s.topic}
            type="button"
            onClick={() => setTopic(s.topic)}
            className={`chip ${topic === s.topic ? 'chip-active' : ''}`}
          >
            <span>{s.emoji}</span> {s.topic}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const StepCount = ({ value, setValue }) => {
  const markers = [5, 8, 10, 12, 15, 20];

  const handleCustomInput = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setValue(1);
      return;
    }

    const nextValue = Number(raw);
    if (Number.isNaN(nextValue)) return;
    setValue(Math.max(1, Math.floor(nextValue)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Total Questions
            </div>
            <div className="text-4xl font-extrabold text-[var(--text)] mt-1">
              <span className="gradient-text">{value}</span> Questions
            </div>
          </div>
          <div className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
            <Clock size={13} className="text-[var(--primary)]" />
            Estimated time: ~{Math.max(3, Math.round(value * 0.8))} mins
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5">
          <Hash size={16} className="text-[var(--primary)]" />
          <input
            type="number"
            min={1}
            value={value}
            onChange={handleCustomInput}
            className="w-full bg-transparent text-base font-semibold text-[var(--text)] outline-none"
            aria-label="Custom number of questions"
          />
        </div>

        <input
          type="range"
          min={1}
          max={50}
          value={Math.min(value, 50)}
          onChange={(e) => setValue(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--primary)] cursor-pointer"
        />

        <div className="flex justify-between items-center mt-3">
          {markers.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setValue(m)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                value === m
                  ? 'bg-[var(--primary)] text-white shadow-sm scale-110'
                  : 'bg-[var(--panel)] border border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StepDifficulty = ({ value, setValue }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {DIFFICULTIES.map((d) => {
      const selected = value === d.level;
      return (
        <button
          key={d.level}
          type="button"
          onClick={() => setValue(d.level)}
          className={`option-card ${selected ? 'selected' : ''}`}
        >
          <div className="text-2xl flex-shrink-0">{d.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-sm text-[var(--text)]">{d.level}</div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{d.desc}</p>
          </div>
          {selected && <div className="option-check">✓</div>}
        </button>
      );
    })}
  </div>
);

const StepLanguage = ({ value, setValue }) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {LANGUAGES.map((option) => {
        const selected = value === option.name;
        return (
          <button
            key={option.name}
            type="button"
            onClick={() => setValue(option.name)}
            className={`option-card ${selected ? 'selected' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 font-bold text-sm ${selected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--primary)]'}`}>
              {option.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-sm text-[var(--text)]">{option.name}</div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{option.native}</p>
            </div>
            {selected && <div className="option-check">✓</div>}
          </button>
        );
      })}
    </div>
    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
      Or type another language
      <input
        value={LANGUAGES.some((option) => option.name === value) ? '' : value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="For example: German, Japanese, Arabic"
        className="input-field mt-2"
      />
    </label>
  </div>
);

const StepFeedbackMode = ({ value, setValue }) => (
  <div className="grid grid-cols-1 gap-3.5">
    {FEEDBACK_MODES.map((option) => {
      const selected = value === option.mode;
      return (
        <button
          key={option.mode}
          type="button"
          onClick={() => setValue(option.mode)}
          className={`option-card p-4 ${selected ? 'selected' : ''}`}
        >
          <div
            className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ${
              selected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--text-muted)]'
            }`}
          >
            <Clock size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm text-[var(--text)]">{option.mode}</div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{option.desc}</p>
          </div>
          {selected && <div className="option-check">✓</div>}
        </button>
      );
    })}
  </div>
);

export default QuizSetupPage;
