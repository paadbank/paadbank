'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Notification } from '@/models/ExpenseRecord';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useDemandState } from '@/lib/state-stack';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function NotificationsPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [notifications, demandNotifications] = useDemandState<Notification[]>([], {
    key: 'notifications',
    persist: true,
    ttl: 60
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      await demandNotifications(async ({ set }) => {
        const { data: { user } } = await supabaseBrowser.auth.getUser();
        if (!user) return;

        const { data, error } = await supabaseBrowser
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        set(data?.map(d => Notification.from(d)) || []);
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabaseBrowser
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    loadNotifications();
  };

  return (
    <main className={`${styles.container} ${styles[`container_${theme}`]}`}>
      <div className={styles.content}>
        <div className={styles.topSection}>
          <h1 className={styles.title}>Notifications</h1>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <EmptyRecord message="No notifications" onReload={loadNotifications} theme={theme} />
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`${styles.card} ${styles[`card_${theme}`]} ${!notif.isRead ? styles.unread : ''}`}>
              <div className={styles.cardHeader}>
                <h3>{notif.title}</h3>
                {!notif.isRead && (
                  <button onClick={() => markAsRead(notif.id)} className={styles.markButton}>
                    Mark Read
                  </button>
                )}
              </div>
              <p className={styles.message}>{notif.message}</p>
              <span className={styles.time}>{new Date(notif.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
