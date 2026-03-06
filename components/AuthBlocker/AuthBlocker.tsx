'use client';
import styles from './AuthBlocker.module.css';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthContext } from '@/providers/AuthProvider'

export default function AuthBlocker({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { initialized } = useAuthContext();

  return (
    <div className={styles.ab_span}>
      <div className={!initialized ? styles.hide : ''}>{children}</div>
      <div className={!initialized ? `${styles.overlay} ${styles[`overlay_${theme}`]}` : styles.hide}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
}
