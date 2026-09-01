import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, XCircle, AlertCircle, Sparkles, Zap, Shield, Star, ArrowRight, ChevronDown, Info } from 'lucide-react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sz = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  return <div className={`spinner ${sz} ${className}`} />;
};

const StageMessage = ({ stage, substage }) => (
  <div>
    <div className="ai-loader-stage">{stage}</div>
    {substage && <div className="ai-loader-substage">{substage}</div>}
  </div>
);

const AIGenerationLoader = ({ open, topic, language, stages }) => {
  const defaultStages = [
    { stage: 'Analyzing your topic', substage: `Topic: ${topic || 'Knowledge Quest'}` },
    { stage: 'Configuring quiz model', substage: 'Preparing a focused learning flow' },
    { stage: 'Synthesizing adaptive questions', substage: 'Calibrating difficulty and depth' },
    { stage: 'Validating answer accuracy', substage: 'Cross-checking explanations' },
    { stage: 'Finalizing your personalized quest', substage: 'Almost ready to begin…' },
  ];
  const activeStages = stages?.length ? stages : defaultStages;
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (!open) {
      setIdx(0);
      setProgress(12);
      return;
    }
    const stageInterval = setInterval(() => {
      setIdx((i) => (i < activeStages.length - 1 ? i + 1 : i));
    }, 1500);
    const progInterval = setInterval(() => {
      setProgress((p) => {
        const target = ((idx + 1) / activeStages.length) * 100;
        const next = Math.min(target, p + 3.5 + Math.random() * 2);
        return Math.min(next, 98);
      });
    }, 200);
    return () => {
      clearInterval(stageInterval);
      clearInterval(progInterval);
    };
  }, [open, idx, activeStages.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ai-loader-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="ai-loader-content"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ai-orbit">
              <div className="ai-orbit-ring" />
              <div className="ai-orbit-ring alt" />
              <div className="ai-orbit-core">
                <Brain size={28} strokeWidth={2.4} />
              </div>
            </div>

            <StageMessage stage={activeStages[idx]?.stage} substage={activeStages[idx]?.substage} />

            <div className="ai-progress-wrap">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-[var(--text-muted)]">Gemini AI Generating Quest</span>
                <span className="text-[var(--primary)] font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar-wrap">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: '12%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 w-full text-left">
              {activeStages.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 transition-opacity duration-300"
                  style={{ opacity: i <= idx ? 1 : 0.4 }}
                >
                  <div
                    className={`w-6 h-6 rounded-full grid place-items-center flex-shrink-0 text-xs font-bold ${
                      i < idx
                        ? 'bg-[var(--success-soft)] text-[var(--success)]'
                        : i === idx
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--line)]'
                    }`}
                  >
                    {i < idx ? <CheckCircle2 size={14} /> : i === idx ? '⚡' : i + 1}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      i === idx ? 'text-[var(--text)] font-semibold' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {s.stage}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EmptyState = ({ title, description, icon: Icon, action }) => (
  <div className="empty-state">
    <div className="empty-icon">
      {Icon ? <Icon size={26} /> : <Brain size={26} />}
    </div>
    <div className="text-lg font-bold text-[var(--text)]">{title}</div>
    {description && (
      <p className="mt-1 text-[var(--text-muted)] text-sm max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const PremiumCard = ({ children, className = '' }) => (
  <div className={`glass-effect ${className}`}>{children}</div>
);

const FeatureBadge = ({ icon: Icon, label }) => (
  <span className="badge-pill badge-brand">
    {Icon && <Icon size={12} />}
    {label}
  </span>
);

const StatisticCard = ({ label, value, icon: Icon, tone = 'brand' }) => (
  <div className="stat-card">
    <div className={`stat-icon stat-icon-${tone}`}>
      {Icon && <Icon size={20} />}
    </div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

const GlassCard = ({ children, className = '' }) => (
  <div className={`glass-effect ${className}`}>{children}</div>
);

const NeonGlow = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export {
  Spinner,
  AIGenerationLoader,
  EmptyState,
  StageMessage,
  PremiumCard,
  FeatureBadge,
  StatisticCard,
  GlassCard,
  NeonGlow,
};
