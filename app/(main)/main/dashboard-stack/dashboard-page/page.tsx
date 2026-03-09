'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useTheme } from '@/context/ThemeContext';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function DashboardPage() {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabaseBrowser
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      if (profileData?.role === 'beneficiary') {
        const [{ data: cycles }, { data: distributions }, { data: notifications }] = await Promise.all([
          supabaseBrowser.from('cycle_logs').select('*').eq('beneficiary_id', user.id),
          supabaseBrowser.from('distributions').select('*').eq('beneficiary_id', user.id),
          supabaseBrowser.from('notifications').select('*').eq('recipient_id', user.id).eq('is_read', false)
        ]);
        setStats({
          totalCycles: cycles?.length || 0,
          totalDistributions: distributions?.length || 0,
          unreadNotifications: notifications?.length || 0,
          nextPeriod: profileData.next_period_date
        });
      } else if (profileData?.role === 'distributor') {
        const [{ data: distributions }, { data: beneficiaries }] = await Promise.all([
          supabaseBrowser.from('distributions').select('*').eq('distributor_id', user.id),
          supabaseBrowser.from('profiles').select('*').eq('assigned_distributor_id', user.id)
        ]);
        const pending = distributions?.filter(d => d.status === 'pending').length || 0;
        setStats({
          totalDistributions: distributions?.length || 0,
          pendingDistributions: pending,
          assignedBeneficiaries: beneficiaries?.length || 0
        });
      } else if (profileData?.role === 'sales') {
        const { data: expenses } = await supabaseBrowser.from('expense_records').select('*');
        const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount_spent), 0) || 0;
        const totalGiven = expenses?.reduce((sum, e) => sum + Number(e.amount_given), 0) || 0;
        setStats({
          totalExpenses: expenses?.length || 0,
          totalSpent,
          totalGiven,
          balance: totalGiven - totalSpent
        });
      } else if (profileData?.role === 'logger') {
        const [{ data: cycles }, { count: beneficiaryCount }] = await Promise.all([
          supabaseBrowser.from('cycle_logs').select('*'),
          supabaseBrowser.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'beneficiary')
        ]);
        const recentCycles = cycles?.filter(c => {
          const logDate = new Date(c.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate >= weekAgo;
        }).length || 0;
        setStats({
          totalCycles: cycles?.length || 0,
          recentCycles,
          beneficiaryCount: beneficiaryCount || 0,
          openCycles: cycles?.filter(c => c.status === 'open').length || 0
        });
      } else if (profileData?.role === 'manager' || profileData?.role === 'admin') {
        const [{ count: beneficiaryCount }, { count: distributorCount }, { data: distributions }, { data: expenses }] = await Promise.all([
          supabaseBrowser.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'beneficiary'),
          supabaseBrowser.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'distributor'),
          supabaseBrowser.from('distributions').select('*'),
          supabaseBrowser.from('expense_records').select('*')
        ]);
        const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount_spent), 0) || 0;
        setStats({
          beneficiaryCount: beneficiaryCount || 0,
          distributorCount: distributorCount || 0,
          totalDistributions: distributions?.length || 0,
          totalExpenses: totalSpent
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`${styles.container} ${styles[`container_${theme}`]}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome, {profile?.full_name}!</h1>
          <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className={styles.grid}>
          {profile?.role === 'beneficiary' && (
            <>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>📅</div>
                <h3>Total Cycles</h3>
                <p className={styles.value}>{stats.totalCycles}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>📦</div>
                <h3>Distributions</h3>
                <p className={styles.value}>{stats.totalDistributions}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>🔔</div>
                <h3>Notifications</h3>
                <p className={styles.value}>{stats.unreadNotifications}</p>
              </div>
              {stats.nextPeriod && (
                <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                  <div className={styles.cardIcon}>📆</div>
                  <h3>Next Period</h3>
                  <p className={styles.value}>{new Date(stats.nextPeriod).toLocaleDateString()}</p>
                </div>
              )}
            </>
          )}

          {profile?.role === 'distributor' && (
            <>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>👥</div>
                <h3>Assigned Beneficiaries</h3>
                <p className={styles.value}>{stats.assignedBeneficiaries}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>📦</div>
                <h3>Total Distributions</h3>
                <p className={styles.value}>{stats.totalDistributions}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>⏳</div>
                <h3>Pending</h3>
                <p className={styles.value}>{stats.pendingDistributions}</p>
              </div>
            </>
          )}

          {profile?.role === 'sales' && (
            <>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>💰</div>
                <h3>Total Given</h3>
                <p className={styles.value}>${stats.totalGiven?.toFixed(2)}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>💸</div>
                <h3>Total Spent</h3>
                <p className={styles.value}>${stats.totalSpent?.toFixed(2)}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>💵</div>
                <h3>Balance</h3>
                <p className={styles.value}>${stats.balance?.toFixed(2)}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>📊</div>
                <h3>Total Expenses</h3>
                <p className={styles.value}>{stats.totalExpenses}</p>
              </div>
            </>
          )}

          {profile?.role === 'logger' && (
            <>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>📝</div>
                <h3>Total Cycles Logged</h3>
                <p className={styles.value}>{stats.totalCycles}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>🆕</div>
                <h3>Recent (7 days)</h3>
                <p className={styles.value}>{stats.recentCycles}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>👥</div>
                <h3>Beneficiaries</h3>
                <p className={styles.value}>{stats.beneficiaryCount}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>🔓</div>
                <h3>Open Cycles</h3>
                <p className={styles.value}>{stats.openCycles}</p>
              </div>
            </>
          )}

          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>👥</div>
                <h3>Beneficiaries</h3>
                <p className={styles.value}>{stats.beneficiaryCount}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>🚚</div>
                <h3>Distributors</h3>
                <p className={styles.value}>{stats.distributorCount}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>📦</div>
                <h3>Distributions</h3>
                <p className={styles.value}>{stats.totalDistributions}</p>
              </div>
              <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardIcon}>💰</div>
                <h3>Total Expenses</h3>
                <p className={styles.value}>${stats.totalExpenses?.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
