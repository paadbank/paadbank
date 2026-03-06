'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function AdminPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setUserRole(profile?.role || '');

      let query = supabaseBrowser.from('profiles').select('*').order('created_at', { ascending: false });

      if (filter !== 'all') {
        if (filter === 'pending') {
          query = query.eq('status', 'pending');
        } else {
          query = query.eq('role', filter);
        }
      }

      const { data } = await query;
      setUsers(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    await supabaseBrowser.from('profiles').update({ status }).eq('id', userId);
    loadData();
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!confirm(`Change user role to ${role}?`)) return;
    await supabaseBrowser.from('profiles').update({ role }).eq('id', userId);
    loadData();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    await supabaseBrowser.from('profiles').delete().eq('id', userId);
    loadData();
  };

  if (loading) return <LoadingSpinner />;

  const canDelete = userRole === 'admin';
  const canManage = ['manager', 'admin'].includes(userRole);

  return (
    <main className={`${styles.container} ${styles[`container_${theme}`]}`}>
      <header className={`${styles.header} ${styles[`header_${theme}`]}`}>
        <div className={styles.headerContent}>
          <div>
            <button className={styles.backButton} onClick={() => nav.pop()} aria-label="Go back">
              <svg className={styles.backIcon} viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0424 0.908364L1.01887 8.84376C0.695893 9.12721 0.439655 9.46389 0.264823 9.83454C0.089992 10.2052 0 10.6025 0 11.0038C0 11.405 0.089992 11.8024 0.264823 12.173C0.439655 12.5437 0.695893 12.8803 1.01887 13.1638L10.0424 21.0992C12.2373 23.0294 16 21.6507 16 18.9239V3.05306C16 0.326231 12.2373 -1.02187 10.0424 0.908364Z" fill="currentColor" />
              </svg>
            </button>
            <h1 className={styles.title}>User Management</h1>
          </div>
        </div>
      </header>

      <div className={styles.innerBody}>

        <div className={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('beneficiary')}
            className={`${styles.filterBtn} ${filter === 'beneficiary' ? styles.active : ''}`}
          >
            Beneficiaries
          </button>
          <button
            onClick={() => setFilter('distributor')}
            className={`${styles.filterBtn} ${filter === 'distributor' ? styles.active : ''}`}
          >
            Distributors
          </button>
          <button
            onClick={() => setFilter('sales')}
            className={`${styles.filterBtn} ${filter === 'sales' ? styles.active : ''}`}
          >
            Sales
          </button>
          <button
            onClick={() => setFilter('manager')}
            className={`${styles.filterBtn} ${filter === 'manager' ? styles.active : ''}`}
          >
            Managers
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`${styles.filterBtn} ${filter === 'admin' ? styles.active : ''}`}
          >
            Admins
          </button>
        </div>

        {users.length === 0 ? (
          <EmptyRecord message="No users found" onReload={loadData} theme={theme} />
        ) : (
          <div className={styles.userGrid}>
            {users.map(user => (
              <div key={user.id} className={`${styles.card} ${styles[`card_${theme}`]}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{user.full_name}</h3>
                    <p className={styles.email}>{user.email}</p>
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                    <span className={`${styles.badge} ${styles[user.status]}`}>{user.status}</span>
                  </div>
                </div>

                <div className={styles.details}>
                  {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                  {user.location && <p><strong>Location:</strong> {user.location}</p>}
                  {user.occupation && <p><strong>Occupation:</strong> {user.occupation}</p>}
                  <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                {canManage && (
                  <div className={styles.actions}>
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateUserStatus(user.id, 'inactive')}
                          className={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {user.status === 'active' && (
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="beneficiary">Beneficiary</option>
                        <option value="distributor">Distributor</option>
                        <option value="sales">Sales</option>
                        <option value="manager">Manager</option>
                        {userRole === 'admin' && <option value="admin">Admin</option>}
                      </select>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className={styles.deleteBtn}
                        title="Delete User"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
