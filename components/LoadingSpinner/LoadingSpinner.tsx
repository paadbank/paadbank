'use client';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  centered?: boolean;
}

export default function LoadingSpinner({ size = 'medium', text, centered = true }: LoadingSpinnerProps) {
  const sizeClass = size === 'small' ? styles.spinnerSmall : size === 'large' ? styles.spinnerLarge : '';
  
  const spinner = <div className={`${styles.spinner} ${sizeClass}`}></div>;
  
  if (text) {
    return (
      <div className={`${styles.loadingContainer} ${centered ? styles.centered : ''}`}>
        {spinner}
        <p className={styles.loadingText}>{text}</p>
      </div>
    );
  }
  
  if (centered) {
    return (
      <div className={styles.centered}>
        {spinner}
      </div>
    );
  }
  
  return spinner;
}
