import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const ProtectedLayout = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="loading-card">
          <div className="spinner" />
          <div>
            <div className="font-semibold text-lg">Loading MindQuest…</div>
            <div className="text-[var(--text-muted)] text-sm mt-1">Preparing your experience</div>
          </div>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell>{children}</AppShell>
  );
};

const AppShell = ({ children }) => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const saved = localStorage.getItem('mq-theme');
      const defaultTheme = saved || 'light';
      document.documentElement.setAttribute('data-theme', defaultTheme);
      document.documentElement.classList.toggle('dark', defaultTheme === 'dark');
    }
  }, []);

  return (
    <div className="app-page">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>
    </div>
  );
};

const PagePadding = ({ children, size = 'md', className = '' }) => {
  const spacing = {
    sm: 'py-10',
    md: 'py-16',
    lg: 'py-24',
  }[size] || 'py-16';
  return (
    <div className={`${spacing} ${className}`}>
      <div className="container-x">{children}</div>
    </div>
  );
};

export { ProtectedLayout, AppShell, PagePadding };
export default ProtectedLayout;
