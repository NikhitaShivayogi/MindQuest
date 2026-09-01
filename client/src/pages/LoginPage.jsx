import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  Brain,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PageTransition, FadeIn } from '../components/Animated';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      await login(email.trim(), password);
      setSuccess('Signed in successfully. Redirecting…');
      setTimeout(() => navigate(from, { replace: true }), 500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@mindquest.ai');
    setPassword('demo123');
    setError('');
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
                {t('welcomeBackTitle')}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1.5">
                {t('signInSubtitle')}
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
                      autoFocus
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={loading}
                      autoComplete="current-password"
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
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-lg w-full mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner spinner-sm" /> {t('signInLoading')}
                    </>
                  ) : (
                    <>
                      <LogIn size={16} /> {t('signInButton')}
                    </>
                  )}
                </button>
              </form>

              <div className="divider my-5">{t('or')}</div>

              <button
                type="button"
                onClick={fillDemoAccount}
                className="btn-secondary w-full"
                disabled={loading}
              >
                <Sparkles size={15} className="text-[var(--primary)]" /> {t('fillDemo')}
              </button>

              <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
                {t('noAccountText')}{' '}
                <Link to="/register" className="font-bold text-[var(--primary)] hover:underline">
                  {t('createAccountButton')}
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
