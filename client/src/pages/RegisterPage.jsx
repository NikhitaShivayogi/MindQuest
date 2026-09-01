import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Brain,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PageTransition, FadeIn } from '../components/Animated';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const strength = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthBars = [0, 1, 2, 3, 4].map((i) => {
    if (i < strength) {
      if (strength <= 2) return 'bg-[var(--danger)]';
      if (strength <= 3) return 'bg-[var(--warning)]';
      return 'bg-[var(--success)]';
    }
    return 'bg-[var(--surface-strong)]';
  });

  const strengthLabel =
    strength <= 2 ? t('weak') : strength <= 3 ? t('medium') : t('strong');

  const validate = () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Please enter a password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, confirmPassword);
      setSuccess('Account created successfully! Redirecting…');
      setTimeout(() => navigate('/dashboard', { replace: true }), 600);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not create account. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-container">
          <FadeIn delay={0.05} direction="down">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-6">
                <ArrowLeft size={14} /> {t('backToMindQuestText')}
              </Link>
              
              <div className="flex justify-center mb-3">
                <div className="brand-mark w-12 h-12 rounded-2xl shadow-lg">
                  <Brain size={26} strokeWidth={2.4} />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {t('createAccountTitle')}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1.5">
                {t('createAccountMessage')}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="auth-card">
              {error && (
                <div className="error-box mb-5">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div className="success-box mb-5">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <div>{success}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    {t('fullName')}
                  </label>
                  <div className="input-icon-field">
                    <User size={16} />
                    <input
                      id="name"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={loading}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    {t('email')}
                  </label>
                  <div className="input-icon-field">
                    <Mail size={16} />
                    <input
                      id="email"
                      type="email"
                      className="input-field"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    {t('password')}
                  </label>
                  <div className="input-icon-field">
                    <Lock size={16} />
                    <input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className="grid grid-cols-5 gap-1">
                        {strengthBars.map((c, i) => (
                          <div key={i} className={`h-1 rounded-full ${c} transition-colors`} />
                        ))}
                      </div>
                      <div className="text-[0.7rem] font-semibold text-[var(--text-muted)]">
                        {t('passwordStrength')}: <span className="text-[var(--text)]">{strengthLabel}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    {t('confirmPassword')}
                  </label>
                  <div className="input-icon-field">
                    <Lock size={16} />
                    <input
                      id="confirmPassword"
                      type={showPwd2 ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPwd2((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
                      aria-label={showPwd2 ? 'Hide password' : 'Show password'}
                    >
                      {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div className="mt-1 text-[0.75rem] font-semibold">
                      {password === confirmPassword ? (
                        <span className="text-[var(--success)] inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Passwords match
                        </span>
                      ) : (
                        <span className="text-[var(--danger)]">Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-lg w-full mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner spinner-sm" /> {t('creatingAccountLoading')}
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> {t('createAccountButton')}
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
                {t('yesAccountText')}{' '}
                <Link to="/login" className="font-bold text-[var(--primary)] hover:underline">
                  {t('signInShort')}
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
