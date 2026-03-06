'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from '../../auth-form.module.css';

function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || otp.length !== 6) return;
    
    setVerifying(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabaseBrowser.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) throw error;
      
      if (data?.session) {
        router.push('/main');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    setMessage('');
    setError('');

    try {
      const { error } = await supabaseBrowser.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;
      setMessage(t('verification_sent') || 'Verification code sent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend');
    } finally {
      setResending(false);
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

        <h1 className={styles.title}>{t('verify_email') || 'Verify Your Email'}</h1>
        
        <p className={styles.text}>
          {t('verification_message') || 'We sent a 6-digit verification code to'}
        </p>
        {email && <p className={styles.email}>{email}</p>}
        
        <p className={styles.text}>
          {t('check_inbox') || 'Please check your inbox and enter the code below.'}
        </p>

        <form onSubmit={handleVerify} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{t('verification_code') || 'Verification Code'}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={styles.input}
              placeholder="000000"
              maxLength={6}
              required
              disabled={verifying}
              autoFocus
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.message}>{message}</div>}

          <button
            type="submit"
            className={styles.button}
            disabled={verifying || !email || !otp}
          >
            {verifying && <div className={styles.spinner}></div>}
            {verifying ? (t('verifying') || 'Verifying...') : (t('verify') || 'Verify')}
          </button>
        </form>

        <button
          onClick={handleResend}
          className={styles.cancelButton}
          disabled={resending}
          type="button"
        >
          {resending ? (t('sending') || 'Sending...') : (t('resend') || 'Resend Code')}
        </button>

        <div className={styles.footer}>
          <a href="/login" className={styles.link}>
            {t('back_to_login') || 'Back to Login'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerificationForm />
    </Suspense>
  );
}
