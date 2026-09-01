import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sun,
  Moon,
  LayoutDashboard,
  Home,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const THEME_KEY = 'mq-theme';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof document === 'undefined') return 'light';
    const saved = localStorage.getItem(THEME_KEY);
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className="theme-toggle-btn"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
    </button>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navItemClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="nav-bar">
      <div className="nav-inner">
        {/* Brand */}
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <Brain size={19} strokeWidth={2.5} />
          </span>
          <span className="font-bold tracking-tight text-lg md:text-xl">
            Mind<span className="gradient-text">Quest</span>
          </span>
        </NavLink>

        {/* Desktop: All links & actions grouped on the right */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navItemClass}>
            <Home size={15} /> {t('home')}
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={navItemClass}>
                <LayoutDashboard size={15} /> {t('dashboard')}
              </NavLink>
              <NavLink to="/profile" className={navItemClass}>
                <UserCircle2 size={15} /> {t('profile')}
              </NavLink>
            </>
          )}

          <div className="ml-3 pl-3 border-l border-[var(--line)] flex items-center gap-2">
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className="btn-ghost btn-sm">
                  <LogIn size={15} /> {t('signIn')}
                </NavLink>
                <NavLink to="/register" className="btn-primary btn-sm">
                  <UserPlus size={15} /> {t('getStarted')}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/quiz-setup" className="btn-primary btn-sm">
                  <Sparkles size={14} /> {t('newQuest')}
                </NavLink>

                <div className="flex items-center gap-2 pl-2 border-l border-[var(--line)] relative">
                  <div className="relative">
                    <div
                      className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-[var(--surface)] border border-[var(--line)] cursor-pointer hover:bg-[var(--surface-strong)] transition-colors"
                      onClick={() => setProfileMenuOpen((prev) => !prev)}
                      title="User menu"
                    >
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white grid place-items-center text-xs font-bold shadow-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text)] max-w-[100px] truncate">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </div>

                    {profileMenuOpen && (
                      <div className="absolute right-0 top-12 w-48 rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-xl p-2 z-50">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--surface)]"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/profile');
                          }}
                        >
                          {t('viewProfile')}
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--surface)]"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/dashboard');
                          }}
                        >
                          {t('dashboard')}
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-[var(--surface)]"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          {t('signOut')}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="theme-toggle-btn text-[var(--text-muted)] hover:text-[var(--danger)]"
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setMenuOpen((m) => !m)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur-xl px-4 py-4 overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              <NavLink to="/" end onClick={() => setMenuOpen(false)} className={navItemClass}>
                <Home size={16} /> {t('home')}
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={navItemClass}>
                    <LayoutDashboard size={16} /> {t('dashboard')}
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={navItemClass}>
                    <UserCircle2 size={16} /> {t('profile')}
                  </NavLink>
                  <NavLink
                    to="/quiz-setup"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary btn-sm mt-2 justify-center"
                  >
                    <Sparkles size={15} /> {t('newQuest')}
                  </NavLink>
                  <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white grid place-items-center text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text)]">{user?.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{user?.email}</div>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="btn-danger btn-sm">
                      <LogOut size={14} /> Exit
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--line)]">
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary btn-sm justify-center">
                    <LogIn size={15} /> Sign In
                  </NavLink>
                  <NavLink to="/register" onClick={() => setMenuOpen(false)} className="btn-primary btn-sm justify-center">
                    <UserPlus size={15} /> Get Started
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
export { ThemeToggle };
