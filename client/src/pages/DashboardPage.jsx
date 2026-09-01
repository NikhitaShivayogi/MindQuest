import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Trophy,
  BrainCircuit,
  Zap,
  TrendingUp,
  Calendar,
  Sparkles,
  LogOut,
  BookOpen,
  Target,
  Award,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Spinner, EmptyState } from '../components/SharedUI';
import { PageTransition, FadeIn } from '../components/Animated';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    totalQuests: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestionsAnswered: 0,
    currentStreak: 0,
  });
  const [recentQuests, setRecentQuests] = useState([]);
  const [performance, setPerformance] = useState({
    difficultyStats: {},
    topicStats: {},
    recentAssessments: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, performanceRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getPerformance(10),
        ]);

        setStats(statsRes.data.stats || {});
        setPerformance(performanceRes.data.performance || {});
        setRecentQuests(performanceRes.data.performance?.recentAssessments || []);
      } catch (error) {
        console.error('Dashboard fetch error', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const chartData = recentQuests.map((quest) => ({
    name: quest.topic.length > 10 ? `${quest.topic.slice(0, 10)}…` : quest.topic,
    score: quest.score,
  }));

  const difficultyData = Object.entries(performance.difficultyStats || {}).map(([key, value]) => ({
    name: key,
    score: value.averageScore,
  }));

  const achievements = [
    { name: 'First Quest', desc: 'Complete your first quest', unlocked: stats.totalQuests >= 1, icon: BookOpen },
    { name: 'Perfect Score', desc: 'Score 100% on any quest', unlocked: stats.bestScore >= 100, icon: Target },
    { name: 'Quiz Master', desc: 'Complete 5 quests', unlocked: stats.totalQuests >= 5, icon: BrainCircuit },
    { name: 'Topic Explorer', desc: 'Try 3 different topics', unlocked: Object.keys(performance.topicStats || {}).length >= 3, icon: Sparkles },
    { name: 'Streak Keeper', desc: 'Maintain a 3-day streak', unlocked: stats.currentStreak >= 3, icon: Flame },
    { name: 'Milestone 10', desc: 'Complete 10 quests', unlocked: stats.totalQuests >= 10, icon: Trophy },
  ];

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="loading-wrap">
        <div className="loading-card">
          <Spinner />
          <div>
            <div className="font-semibold text-base text-[var(--text)]">Loading your workspace…</div>
            <div className="text-[var(--text-muted)] text-xs mt-0.5">Fetching quiz analytics and history</div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="py-8 md:py-12">
        <div className="container-lg">
          {/* Header */}
          <FadeIn delay={0.05} direction="down">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <span className="hero-kicker mb-2.5">
                  <BarChart3 size={13} className="text-[var(--primary)]" /> {t('dashboardHeader')}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)]">
                  {greetingTime()},{' '}
                  <span className="gradient-text">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
                </h1>
                <p className="mt-1.5 text-sm text-[var(--text-muted)] max-w-xl">
                  {t('dashboardSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button onClick={() => navigate('/quiz-setup')} className="btn-primary">
                  <Sparkles size={16} /> {t('newQuestAction')}
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/', { replace: true });
                  }}
                  className="btn-secondary"
                >
                  <LogOut size={15} /> {t('logout')}
                </button>
              </div>
            </div>
          </FadeIn>

          {/* 5 KPI Stat Cards */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4 mb-8">
              {[
                { icon: BrainCircuit, label: t('totalQuests'), value: stats.totalQuests || 0, tone: 'brand', suffix: '' },
                { icon: TrendingUp, label: t('averageScore'), value: stats.averageScore || 0, tone: 'success', suffix: '%' },
                { icon: Trophy, label: t('bestScore'), value: stats.bestScore || 0, tone: 'accent', suffix: '%' },
                { icon: BookOpen, label: t('totalQuestions'), value: stats.totalQuestionsAnswered || 0, tone: 'warning', suffix: '' },
                { icon: Zap, label: t('dailyStreak'), value: stats.currentStreak || 0, tone: 'brand', suffix: 'd' },
              ].map((item, index) => (
                <div key={index} className="stat-card">
                  <div className={`stat-icon stat-icon-${item.tone}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-value">
                    {item.value}
                    {item.suffix && (
                      <span className="text-sm font-semibold opacity-75 ml-0.5">{item.suffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Charts Section */}
          <FadeIn delay={0.25}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Progress Over Time Chart */}
              <div className="glass-effect p-5 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text)]">{t('progressOverTime')}</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('scoresAcrossAssessments')}</p>
                  </div>
                  <span className="badge-pill badge-brand">
                    <Calendar size={12} /> Recent Quests
                  </span>
                </div>
                <div className="h-64">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-muted)"
                          tick={{ fontSize: 11, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          tick={{ fontSize: 11, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'var(--panel)' }}
                          activeDot={{ r: 6, fill: '#8b5cf6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      title="No quiz history yet"
                      description="Complete your first quest to unlock score progress charts."
                      icon={BarChart3}
                    />
                  )}
                </div>
              </div>

              {/* Difficulty Breakdown Chart */}
              <div className="glass-effect p-5 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text)]">Difficulty Performance</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Average score by difficulty level</p>
                  </div>
                  <span className="badge-pill badge-warning">
                    <Target size={12} /> Accuracy
                  </span>
                </div>
                <div className="h-64">
                  {difficultyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-muted)"
                          tick={{ fontSize: 11, fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          tick={{ fontSize: 11, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Bar
                          dataKey="score"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                          barSize={36}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      title="No difficulty data"
                      description="Try quests at different difficulty tiers to view accuracy comparisons."
                      icon={Target}
                    />
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Recent Quests & Achievements Grid */}
          <FadeIn delay={0.35}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Quests List */}
              <div className="glass-effect p-5 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--text)]">Recent Quests</h2>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    {recentQuests.length} total
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {recentQuests.length > 0 ? (
                    recentQuests.map((quest, index) => (
                      <div
                        key={index}
                        className="quest-card cursor-pointer"
                        onClick={() => navigate(`/results/${quest._id || quest.id}`)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] grid place-items-center flex-shrink-0">
                            <BrainCircuit size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[var(--text)] truncate">{quest.topic}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {quest.language} · <span className="font-semibold">{quest.difficulty}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-3">
                          <p
                            className="font-extrabold text-base"
                            style={{
                              color:
                                (quest.score ?? 0) >= 70
                                  ? 'var(--success)'
                                  : (quest.score ?? 0) >= 50
                                  ? 'var(--warning)'
                                  : 'var(--danger)',
                            }}
                          >
                            {quest.score}%
                          </p>
                          <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">
                            {new Date(quest.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No quests taken yet"
                      description="Start your first AI quest today and build your knowledge streak."
                      action={
                        <button className="btn-primary btn-sm" onClick={() => navigate('/quiz-setup')}>
                          <Sparkles size={14} /> Start Your First Quest
                        </button>
                      }
                      icon={Sparkles}
                    />
                  )}
                </div>
              </div>

              {/* Achievements */}
              <div className="glass-effect p-5 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--text)]">Achievements</h2>
                  <span className="badge-pill badge-success">
                    <Trophy size={12} /> {achievements.filter((a) => a.unlocked).length}/{achievements.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map((item, index) => (
                    <div
                      key={index}
                      className={`achievement-card ${item.unlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="achievement-icon">
                        <item.icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--text)] truncate">{item.name}</p>
                        <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5 truncate">
                          {item.unlocked ? '✓ Unlocked' : item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
