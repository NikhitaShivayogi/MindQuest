import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Brain,
  BarChart3,
  Trophy,
  Target,
  ShieldCheck,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PageTransition, FadeIn, StaggerChildren, HoverLift } from '../components/Animated';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Generated Quizzes',
    desc: 'Each quiz is dynamically generated in real time by Google Gemini. No stale question banks.',
    tone: 'brand',
  },
  {
    icon: BookOpen,
    title: 'Focused Learning Experience',
    desc: 'A clear, streamlined flow keeps setup, questions, feedback, and results easy to follow.',
    tone: 'accent',
  },
  {
    icon: BarChart3,
    title: 'In-Depth Analytics',
    desc: 'Track accuracy curves, difficulty mastery, and topic strengths with high-clarity visualizations.',
    tone: 'accent',
  },
  {
    icon: Trophy,
    title: 'Streaks & Milestones',
    desc: 'Stay motivated with daily learning streaks, unlockable achievements, and performance insights.',
    tone: 'brand',
  },
  {
    icon: Target,
    title: 'Adaptive Difficulty',
    desc: 'From foundational Easy concepts to Expert problem-solving calibrated to your knowledge level.',
    tone: 'accent',
  },
];

const steps = [
  {
    num: '01',
    title: 'Choose Any Topic',
    desc: 'Type any subject, from Quantum Physics and Python concurrency to World History or exam prep.',
  },
  {
    num: '02',
    title: 'Gemini AI Crafts Your Quest',
    desc: 'The engine generates balanced, fact-checked questions tailored to your chosen difficulty.',
  },
  {
    num: '03',
    title: 'Answer & Gain Mastery',
    desc: 'Receive conceptual explanations, score feedback, and analytics on areas to reinforce.',
  },
];

const PREVIEW_TOPICS = [
  { title: 'Fullstack React & Node.js', tag: 'Tech', icon: '⚛️' },
  { title: 'Renaissance Art History', tag: 'Humanities', icon: '🎨' },
  { title: 'Astrophysics & Black Holes', tag: 'Science', icon: '🌌' },
  { title: 'Behavioral Economics', tag: 'Business', icon: '📈' },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedPreview, setSelectedPreview] = useState(0);

  const recommendedTopics = React.useMemo(() => {
    const interests = Array.isArray(user?.profile?.interests) && user.profile.interests.length > 0
      ? user.profile.interests
      : ['React', 'Python', 'Data Science', 'Language Learning'];

    const skillLevel = user?.profile?.skillLevel || 'Beginner';
    const baseTopics = [...interests];

    if (baseTopics.length < 4) {
      baseTopics.push(
        skillLevel === 'Advanced' ? 'System Design' : skillLevel === 'Intermediate' ? 'Pattern Recognition' : 'Foundations',
        'Critical Thinking',
        'Practice Labs'
      );
    }

    return baseTopics.slice(0, 5).map((topic) => {
      const cleanTopic = String(topic).trim();
      return cleanTopic || 'Learning Basics';
    });
  }, [user]);

  if (isAuthenticated) {
    return (
      <PageTransition>
        <div className="container-lg py-10 md:py-14">
          <div className="glass-effect rounded-3xl p-6 md:p-8 border border-[var(--line)]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span className="hero-kicker mb-4">
                  <Sparkles size={13} className="text-[var(--primary)]" />
                  {t('welcomeBack')}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--text)]">
                  {t('hello')}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Learner'}</span>
                </h1>
                <p className="mt-3 text-[var(--text-muted)] max-w-xl text-sm md:text-base">
                  {t('continueJourney')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-primary" onClick={() => navigate('/quiz-setup')}>
                  <Sparkles size={16} /> {t('newQuest')}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                  <BarChart3 size={16} /> {t('dashboard')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="glass-effect rounded-2xl p-5 border border-[var(--line)]">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{t('nextUp')}</p>
              <h3 className="mt-3 text-xl font-bold text-[var(--text)]">{t('continueLearning')}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{t('yourProgressSaved')}</p>
            </div>

            <div className="glass-effect rounded-2xl p-5 border border-[var(--line)]">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{t('profileStatus')}</p>
              <h3 className="mt-3 text-xl font-bold text-[var(--text)]">{user?.profile?.skillLevel || 'Beginner'}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{user?.profile?.bio || 'Add your interests and learning preferences for smarter suggestions.'}</p>
            </div>

            <div className="glass-effect rounded-2xl p-5 border border-[var(--line)]">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{t('learningFocus')}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
            <div className="glass-effect rounded-2xl p-5 md:p-6 border border-[var(--line)]">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-xl font-bold text-[var(--text)]">{t('recommended')}</h2>
                <span className="badge-pill badge-brand">AI Suggestions</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {recommendedTopics.map((topic) => (
                  <button
                    key={topic}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-soft)] transition-colors"
                    onClick={() => navigate('/quiz-setup')}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-5 border border-[var(--line)]">
              <h2 className="text-xl font-bold text-[var(--text)]">{t('quickActions')}</h2>
              <div className="mt-4 space-y-3">
                <button className="w-full btn-primary justify-center" onClick={() => navigate('/quiz-setup')}>
                  <Sparkles size={16} /> {t('startQuest')}
                </button>
                <button className="w-full btn-secondary justify-center" onClick={() => navigate('/dashboard')}>
                  <BarChart3 size={16} /> {t('openDashboard')}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 glass-effect rounded-2xl p-5 md:p-6 border border-[var(--line)]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[var(--text)]">{t('profileSnapshot')}</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">{t('profileSaved')}</p>
              </div>
              <button className="btn-secondary btn-sm" onClick={() => navigate('/profile')}>
                {t('editProfile')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{t('skillLevel')}</div>
                <div className="mt-2 text-lg font-bold text-[var(--text)]">{user?.profile?.skillLevel || 'Beginner'}</div>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{t('preferredLanguage')}</div>
                <div className="mt-2 text-lg font-bold text-[var(--text)]">{user?.profile?.preferredLanguage || 'Default'}</div>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{t('learningFocus')}</div>
                <div className="mt-2 text-lg font-bold text-[var(--text)]">
                  {user?.profile?.goals || 'Build confidence and improve learning consistency.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="container-lg text-center">
            <FadeIn delay={0.05} direction="down">
              <span className="hero-kicker mb-6">
                <Sparkles size={13} className="text-[var(--primary)]" />
                {t('publicHero')}
              </span>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h1 className="hero-title max-w-4xl mx-auto">
                <span className="gradient-text">{t('publicTitle')}</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.25}>
              <p className="hero-copy max-w-2xl mx-auto mt-6">
                {t('createPersonalized')}
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <div className="flex flex-wrap items-center justify-center gap-3.5 mt-9">
                <button
                  className="btn-primary btn-lg"
                  onClick={() => navigate(isAuthenticated ? '/quiz-setup' : '/register')}
                >
                  <Sparkles size={17} />
                  {t('startYourQuest')}
                  <ArrowRight size={17} />
                </button>

                <button
                  className="btn-secondary btn-lg"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                >
                  {isAuthenticated ? (
                    <>
                      <BarChart3 size={17} /> {t('dashboard')}
                    </>
                  ) : (
                    t('exploreMindQuest')
                  )}
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-semibold text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[var(--success)]" /> {t('poweredByGemini')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={15} className="text-[var(--primary)]" /> {t('personalizedQuizzes')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-[var(--success)]" /> {t('freeTier')}
                </span>
              </div>
            </FadeIn>

            {/* Interactive Showcase Preview */}
            <FadeIn delay={0.55}>
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="glass-effect p-6 md:p-8 rounded-3xl shadow-2xl text-left border border-[var(--line)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">{t('liveQuizPreview')}</span>
                      <h3 className="text-lg font-bold text-[var(--text)] mt-0.5">{t('exploreDynamicQuiz')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-pill badge-brand">{t('adaptiveAi')}</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-2.5 my-6">
                    {PREVIEW_TOPICS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPreview(idx)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPreview === idx
                            ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary-strong)] dark:text-[var(--primary)] font-semibold shadow-sm'
                            : 'bg-[var(--surface)] border-[var(--line)] text-[var(--text-soft)] hover:bg-[var(--panel-hover)]'
                        }`}
                      >
                        <div className="text-lg mb-1">{item.icon}</div>
                        <div className="text-xs font-bold truncate">{item.title}</div>
                        <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">{item.tag}</div>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 md:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('sampleQuestion')}</span>
                      <span className="text-xs font-semibold text-[var(--primary)]">{t('difficulty')}: {t('medium')}</span>
                    </div>
                    <p className="text-sm md:text-base font-semibold text-[var(--text)] mb-4">
                      {selectedPreview === 0 && 'How does the React useEffect hook behave when passed an empty dependency array []?'}
                      {selectedPreview === 1 && 'Which Italian artist painted the famous fresco "The School of Athens" in the Vatican?'}
                      {selectedPreview === 2 && 'What is the theoretical boundary around a black hole beyond which nothing can escape?'}
                      {selectedPreview === 3 && 'What cognitive bias explains why individuals value things they already own more highly?'}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {(selectedPreview === 0 ? [
                        'It runs on every component re-render',
                        'It runs only once after the initial mount',
                        'It never executes under any circumstances',
                        'It triggers a strict state reset',
                      ] : selectedPreview === 1 ? [
                        'Michelangelo Buonarroti',
                        'Raphael Sanzio',
                        'Leonardo da Vinci',
                        'Sandro Botticelli',
                      ] : selectedPreview === 2 ? [
                        'The Singularity',
                        'The Event Horizon',
                        'The Ergosphere',
                        'The Accretion Disk',
                      ] : [
                        'The Endowment Effect',
                        'Confirmation Bias',
                        'Anchoring Effect',
                        'Sunk Cost Fallacy',
                      ]).map((option, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                            oIdx === 1
                              ? 'bg-[var(--success-soft)] border-[var(--success)] text-[var(--text)] font-semibold'
                              : 'bg-[var(--panel)] border-[var(--line)] text-[var(--text-soft)]'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md grid place-items-center text-[0.7rem] font-bold ${
                            oIdx === 1 ? 'bg-[var(--success)] text-white' : 'bg-[var(--surface)] text-[var(--text-muted)]'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="truncate">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 border-t border-[var(--line)]">
          <div className="container-lg text-center">
            <div className="max-w-2xl mx-auto mb-14">
              <span className="section-eyebrow">{t('platformFeatures')}</span>
              <h2 className="section-title">
                Engineered for <span className="gradient-text">{t('effortlessLearning')}</span>
              </h2>
              <p className="section-subtitle">
                {t('platformFeatureDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {features.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.08}>
                  <div className="feature-card h-full">
                    <div className="feature-card-icon">
                      <f.icon size={22} />
                    </div>
                    <h3 className="feature-card-title">{f.title}</h3>
                    <p className="feature-card-desc">{f.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-24 border-t border-[var(--line)]">
          <div className="container-lg text-center">
            <div className="max-w-2xl mx-auto mb-14">
              <span className="section-eyebrow">{t('simpleWorkflowTitle')}</span>
              <h2 className="section-title">
                Master any topic in <span className="gradient-text">three steps</span>
              </h2>
              <p className="section-subtitle">
                {t('simpleWorkflowDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              {steps.map((step, idx) => (
                <div key={idx} className="glass-effect p-7 rounded-2xl border border-[var(--line)] relative">
                  <div className="text-3xl font-extrabold text-[var(--primary)] mb-4 font-mono opacity-80">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text)] mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 md:py-20">
          <div className="container-lg">
            <div className="cta-banner">
              <span className="hero-kicker mb-4 inline-flex">
                <Zap size={13} className="text-[var(--primary)]" />
                {t('startYourJourney')}
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight max-w-xl mx-auto">
                {t('readyForJourney')}
              </h2>
              <p className="text-[var(--text-muted)] text-sm md:text-base max-w-md mx-auto mt-3 mb-8">
                {t('noCreditCard')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  className="btn-primary btn-lg"
                  onClick={() => navigate(isAuthenticated ? '/quiz-setup' : '/register')}
                >
                  <Sparkles size={17} />
                  {isAuthenticated ? t('startNewQuest') : t('createFreeAccount')}
                </button>
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn-secondary btn-lg">
                  <BarChart3 size={17} />
                  {isAuthenticated ? t('goToDashboard') : t('signIn')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--line)] py-10 text-sm text-[var(--text-muted)]">
          <div className="container-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="brand-mark w-7 h-7 rounded-lg">
                <Brain size={15} />
              </span>
              <span className="font-bold text-[var(--text)]">
                Mind<span className="gradient-text">Quest</span>
              </span>
            </div>
            <div>
              © {new Date().getFullYear()} MindQuest. Personalized AI knowledge companion.
            </div>
            <div className="text-xs font-medium">
              Powered by <span className="font-semibold text-[var(--text)]">Google Gemini</span>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default HomePage;
