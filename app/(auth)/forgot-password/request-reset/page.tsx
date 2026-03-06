'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useTheme } from '@/context/ThemeContext';
import styles from './request-reset.module.css';

export default function RequestResetPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: resetError } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className={`${styles.container} ${styles[theme]}`}>
        <div className={styles.card}>
          <h1>Check Your Email</h1>
          <p>We've sent password reset instructions to {email}</p>
          <a href="/login" className={styles.link}>Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <div className={styles.card}>
        <h1>Reset Password</h1>
        <p className={styles.subtitle}>Enter your email to receive reset instructions</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          
          <button type="submit">Send Reset Link</button>
        </form>

        <a href="/login" className={styles.link}>Back to Login</a>
      </div>
    </div>
  );
}
