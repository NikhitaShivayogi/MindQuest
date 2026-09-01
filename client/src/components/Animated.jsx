import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const useAnimatedCounter = (target, { duration = 1200, start = 0, decimals = 0, enabled = true } = {}) => {
  const [value, setValue] = useState(enabled ? start : target);
  const frameRef = useRef();
  const startRef = useRef(start);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    const startTime = performance.now();
    const from = startRef.current;
    const delta = target - from;
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + delta * eased;
      setValue(parseFloat(current.toFixed(decimals)));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals, enabled]);

  return value;
};

const PageTransition = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const FadeIn = ({ children, delay = 0, duration = 0.45, direction = 'up', className = '' }) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ScaleIn = ({ children, delay = 0, duration = 0.35, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SlideIn = ({ children, from = 'left', delay = 0, duration = 0.4, className = '' }) => {
  const directions = {
    left: { x: -40 },
    right: { x: 40 },
    top: { y: -40 },
    bottom: { y: 40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StaggerChildren = ({ children, staggerDelay = 0.08, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

const HoverLift = ({ children, className = '', liftAmount = -4 }) => (
  <motion.div
    whileHover={{ y: liftAmount, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
    className={className}
  >
    {children}
  </motion.div>
);

const PulseAnimation = ({ children, className = '', intensity = 1.04 }) => (
  <motion.div
    animate={{ scale: [1, intensity, 1] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

const FloatingAnimation = ({ children, className = '', duration = 4, distance = 8 }) => (
  <motion.div
    animate={{ y: [-distance, distance, -distance] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

const MagneticButton = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const TextReveal = ({ text, className = '', delay = 0 }) => {
  const words = (text || '').split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const CountUp = ({ end, duration = 1.2, start = 0, decimals = 0, suffix = '', prefix = '', className = '' }) => {
  const current = useAnimatedCounter(end, { duration: duration * 1000, decimals, enabled: true, start });

  return (
    <span className={className}>
      {prefix}
      {Number(current).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

const ScoreRing = ({ score, size = 180, stroke = 12 }) => {
  const clamped = Math.max(0, Math.min(100, score || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const animated = useAnimatedCounter(clamped, { duration: 1200 });

  const strokeColor =
    clamped >= 80 ? 'var(--success)' : clamped >= 60 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="score-ring mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--surface)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div className="score-ring-text">
        <div>
          <div className="text-4xl font-extrabold tracking-tight text-[var(--text)]">
            {Math.round(animated)}%
          </div>
          <div className="text-xs font-semibold text-[var(--text-muted)] mt-1">Accuracy</div>
        </div>
      </div>
    </div>
  );
};

const StepIndicator = ({ current, total }) => {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step-dot ${s < current ? 'done' : s === current ? 'active' : ''}`}>
            {s < current ? '✓' : s}
          </div>
          {i < total - 1 && (
            <div className="step-connector">
              <div
                className="step-connector-fill"
                style={{ width: `${s < current ? 100 : s === current ? 50 : 0}%` }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const GlowEffect = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export {
  useAnimatedCounter,
  ScoreRing,
  StepIndicator,
  PageTransition,
  FadeIn,
  ScaleIn,
  SlideIn,
  StaggerChildren,
  HoverLift,
  PulseAnimation,
  FloatingAnimation,
  MagneticButton,
  TextReveal,
  CountUp,
  GlowEffect,
};
export default ScoreRing;
