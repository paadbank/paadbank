'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import { loginWithBeneficiaryId } from '@/lib/auth/beneficiaryAuth';
import styles from '../auth-form.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [loginType, setLoginType] = useState<'email' | 'id'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginType === 'id') {
        const data = await loginWithBeneficiaryId(identifier, password);
        if (data.session) {
          router.push('/main');
        }
      } else {
        const { data, error } = await supabaseBrowser.auth.signInWithPassword({
          email: identifier,
          password,
        });

        if (error) {
          if (error.message === 'Email not confirmed') {
            await supabaseBrowser.auth.resend({
              type: 'signup',
              email: identifier,
            });
            router.push(`/signup/verification?email=${encodeURIComponent(identifier)}`);
            return;
          }
          throw error;
        }

        if (data.session) {
          router.push('/main');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${styles[`container_${theme}`]}`}>
      <div className={styles.card}>
        <button
          onClick={() => window.location.href = '/'}
          className={styles.closeButton}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h1 className={styles.title}>{t('login')}</h1>
        
        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setLoginType('email')}
            className={`${styles.tab} ${loginType === 'email' ? styles.tabActive : ''}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginType('id')}
            className={`${styles.tab} ${loginType === 'id' ? styles.tabActive : ''}`}
          >
            Beneficiary Code
          </button>
        </div>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{loginType === 'email' ? t('email') : 'Beneficiary Code'}</label>
            <input
              type={loginType === 'email' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('password')}</label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading && <div className={styles.spinner}></div>}
            {loading ? t('loading') : t('login')}
          </button>
        </form>

        <div className={styles.footer}>
          <a href="/forgot-password" className={styles.link}>
            {t('forgot_password') || 'Forgot Password?'}
          </a>
          <a href="/signup" className={styles.link}>
            {t('no_account')}
          </a>
        </div>
      </div>
    </div>
  );
}
