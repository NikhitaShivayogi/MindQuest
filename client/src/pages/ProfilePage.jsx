import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Sparkles, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import { PageTransition, FadeIn } from '../components/Animated';

const defaultProfile = {
  bio: '',
  interests: '',
  skillLevel: 'Beginner',
  goals: '',
  learningStyle: 'Self-paced',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    setForm({
      bio: user?.profile?.bio || '',
      interests: Array.isArray(user?.profile?.interests) ? user.profile.interests.join(', ') : '',
      skillLevel: user?.profile?.skillLevel || 'Beginner',
      goals: user?.profile?.goals || '',
      learningStyle: user?.profile?.learningStyle || 'Self-paced',
    });
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const payload = {
        ...form,
        interests: form.interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 10),
      };

      await authAPI.updateProfile(payload);
      await refreshUser();
      setMessage('Your profile has been updated successfully.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to save your profile right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="container-lg py-10 md:py-14">
        <FadeIn delay={0.05} direction="down">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <span className="hero-kicker mb-3 inline-flex">
                <UserCircle2 size={13} className="text-[var(--primary)]" /> {t('profilePageTitle')}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)]">
                {t('profilePageHeading')}
              </h1>
            </div>

            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={15} /> {t('backToDashboard')}
            </button>
          </div>
        </FadeIn>

        <div className="max-w-4xl mx-auto glass-effect rounded-3xl border border-[var(--line)] p-5 md:p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">{t('bio')}</label>
              <textarea
                className="input-field min-h-[110px]"
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about your background and learning goals."
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">{t('interests')}</label>
              <input
                className="input-field"
                value={form.interests}
                onChange={(e) => handleChange('interests', e.target.value)}
                placeholder="React, Python, History, Design, Data Science"
              />
            </div>

            <div>
              <label className="form-label">{t('skillLevel')}</label>
              <select
                className="input-field"
                value={form.skillLevel}
                onChange={(e) => handleChange('skillLevel', e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="form-label">{t('learningStyle')}</label>
              <select
                className="input-field"
                value={form.learningStyle}
                onChange={(e) => handleChange('learningStyle', e.target.value)}
              >
                <option>Self-paced</option>
                <option>Structured</option>
                <option>Practice-first</option>
                <option>Theory-first</option>
              </select>
            </div>

            <div>
              <label className="form-label">{t('primaryGoal')}</label>
              <input
                className="input-field"
                value={form.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                placeholder="Improve frontend skills, prepare for exams..."
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <Save size={15} /> {isSaving ? 'Saving...' : t('saveProfile')}
              </button>

              {message && (
                <div className="text-sm text-[var(--text-muted)]">{message}</div>
              )}
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
