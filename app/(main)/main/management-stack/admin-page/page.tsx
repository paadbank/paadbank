'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import { createUserWithId } from './actions/createUser';
import { updateUserPassword } from './actions/updatePassword';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { useDialog } from '@/lib/DialogViewer';
import styles from './page.module.css';

export default function AdminPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const dialog = useDialog();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    password: '',
    role: 'beneficiary',
    phone: '',
    location: '',
  });
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState({ userId: '', password: '' });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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
    const confirmed = window.confirm(`Change user role to ${role}?`);
    if (confirmed) {
      await supabaseBrowser.from('profiles').update({ role }).eq('id', userId);
      loadData();
    }
  };

  const deleteUser = async (userId: string) => {
    const confirmed = window.confirm('Delete this user? This action cannot be undone.');
    if (confirmed) {
      await supabaseBrowser.from('profiles').delete().eq('id', userId);
      loadData();
    }
  };

  const viewCredentials = (user: any) => {
    setSelectedUser(user);
    const userId = user.beneficiary_code || 'Not valid Id';
    setCredentials({ userId, password: '' });
    setShowUpdatePassword(false);
    setNewPassword('');
    
    dialog.open(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <strong>Beneficiary Code:</strong>
          <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.1em', textAlign: 'center' }}>
            {userId}
          </div>
        </div>
        {showUpdatePassword && (
          <div>
            <strong>New Password:</strong>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        )}
        {!showUpdatePassword && (
          <button
            onClick={() => setShowUpdatePassword(true)}
            style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Update Password
          </button>
        )}
      </div>
    );
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await updateUserPassword(selectedUser.id, newPassword);
      setShowUpdatePassword(false);
      setNewPassword('');
      dialog.close();
      alert('Password updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update password');
    }
  };

  const createBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await createUserWithId({
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: formData.location,
      });

      setCredentials({ userId: result.beneficiaryCode, password: formData.password });
      dialog.open();
      setShowCreateForm(false);
      setFormData({ full_name: '', password: '', role: 'beneficiary', phone: '', location: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  if (loading || creating) return <LoadingSpinner />;

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
          {canManage && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className={styles.addButton}>
              {showCreateForm ? 'Cancel' : '+ Create User'}
            </button>
          )}
        </div>
      </header>

      <div className={styles.innerBody}>

        {showCreateForm && (
          <form onSubmit={createBeneficiary} className={`${styles.form} ${styles[`form_${theme}`]}`}>
            <h3>Create New User</h3>
            <div className={styles.field}>
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Password *</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className={styles.field}>
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="beneficiary">Beneficiary</option>
                <option value="distributor">Distributor</option>
                <option value="sales">Sales</option>
                <option value="logger">Logger</option>
                <option value="manager">Manager</option>
                {userRole === 'admin' && <option value="admin">Admin</option>}
              </select>
            </div>
            <div className={styles.field}>
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <button type="submit" className={styles.submitButton} disabled={creating}>
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}

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
                    <p className={styles.email}>{user.beneficiary_code ? 'Managed by user' : user.email || 'No email'}</p>
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
                      <>
                        <button
                          onClick={() => viewCredentials(user)}
                          className={styles.viewBtn}
                          title="View Credentials"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
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
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <dialog.DialogViewer
        title="User Credentials"
        buttons={[
          ...(showUpdatePassword ? [
            { text: 'Cancel', variant: 'secondary' as const, onClick: () => { setShowUpdatePassword(false); setNewPassword(''); } },
            { text: 'Update', variant: 'primary' as const, onClick: updatePassword }
          ] : [
            { text: 'Close', variant: 'primary' as const, onClick: () => { dialog.close(); setShowUpdatePassword(false); setNewPassword(''); } }
          ])
        ]}
        showCancel={false}
      />
    </main>
  );
}
