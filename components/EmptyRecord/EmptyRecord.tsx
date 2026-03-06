'use client';

import styles from './EmptyRecord.module.css';

interface EmptyRecordProps {
  message?: string;
  onReload?: () => void;
  theme?: string;
}

export default function EmptyRecord({ message = 'No records found', onReload, theme = 'light' }: EmptyRecordProps) {
  return (
    <div className={styles.container}>
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2C7.89543 2 7 2.89543 7 4V20C7 21.1046 7.89543 22 9 22H18C19.1046 22 20 21.1046 20 20V7.41421C20 7.01639 19.842 6.63486 19.5607 6.35355L15.6464 2.43934C15.3651 2.15804 14.9836 2 14.5858 2H9Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M14 2V6C14 7.10457 14.8954 8 16 8H20" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <p className={styles.message}>{message}</p>
      {onReload && (
        <button onClick={onReload} className={`${styles.button} ${styles[`button_${theme}`]}`}>
          Reload
        </button>
      )}
    </div>
  );
}
