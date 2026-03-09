'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useDemandState } from '@/lib/state-stack';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function DistributionPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [distributions, demandDistributions, setDistributions] = useDemandState<any[]>([], {
    key: 'distributions',
    persist: true,
    ttl: 300
  });
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    beneficiary_id: '',
    distribution_date: '',
    num_pads: '',
    transport_mode: 'pickup',
    delivery_address: '',
    delivery_cost: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

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
      console.log('User role:', profile?.role); // Debug log

      await demandDistributions(async ({ set }) => {
        const { data: distData } = await supabaseBrowser
          .from('distributions')
          .select('*, beneficiary:profiles!beneficiary_id(full_name), distributor:profiles!distributor_id(full_name)')
          .order('created_at', { ascending: false });

        set(distData || []);
      });

      const { data: benData } = await supabaseBrowser
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'beneficiary');

      setBeneficiaries(benData || []);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      num_pads: parseInt(formData.num_pads),
      delivery_cost: parseFloat(formData.delivery_cost) || 0,
      distributor_id: user.id,
    };

    if (editingId) {
      await supabaseBrowser.from('distributions').update(payload).eq('id', editingId);
    } else {
      await supabaseBrowser.from('distributions').insert(payload);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      beneficiary_id: '',
      distribution_date: '',
      num_pads: '',
      transport_mode: 'pickup',
      delivery_address: '',
      delivery_cost: '',
      notes: '',
    });

    const { data: distData } = await supabaseBrowser
      .from('distributions')
      .select('*, beneficiary:profiles!beneficiary_id(full_name), distributor:profiles!distributor_id(full_name)')
      .order('created_at', { ascending: false });

    setDistributions(distData || []);
  };

  const handleEdit = (dist: any) => {
    setEditingId(dist.id);
    setFormData({
      beneficiary_id: dist.beneficiary_id,
      distribution_date: dist.distribution_date,
      num_pads: dist.num_pads.toString(),
      transport_mode: dist.transport_mode,
      delivery_address: dist.delivery_address || '',
      delivery_cost: dist.delivery_cost.toString(),
      notes: dist.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this distribution?')) return;
    await supabaseBrowser.from('distributions').delete().eq('id', id);
    
    const { data: distData } = await supabaseBrowser
      .from('distributions')
      .select('*, beneficiary:profiles!beneficiary_id(full_name), distributor:profiles!distributor_id(full_name)')
      .order('created_at', { ascending: false });

    setDistributions(distData || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabaseBrowser.from('distributions').update({ status }).eq('id', id);
    
    const { data: distData } = await supabaseBrowser
      .from('distributions')
      .select('*, beneficiary:profiles!beneficiary_id(full_name), distributor:profiles!distributor_id(full_name)')
      .order('created_at', { ascending: false });

    setDistributions(distData || []);
  };

  if (loading) return <LoadingSpinner />;

  const canDelete = userRole === 'admin';
  const canCreate = ['distributor', 'manager', 'admin'].includes(userRole);

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
            <h1 className={styles.title}>Distributions</h1>
          </div>
          {canCreate && (
            <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
              <span className={styles.addButtonTextFull}>{showForm ? 'Cancel' : '+ New'}</span>
              <span className={styles.addButtonTextShort}>{showForm ? 'Cancel' : '+'}</span>
            </button>
          )}
        </div>
      </header>

      <div className={styles.innerBody}>

        {showForm && (
          <form onSubmit={handleSubmit} className={`${styles.form} ${styles[`form_${theme}`]}`}>
            <div className={styles.field}>
              <label>Beneficiary *</label>
              <select
                value={formData.beneficiary_id}
                onChange={(e) => setFormData({ ...formData, beneficiary_id: e.target.value })}
                required
              >
                <option value="">Select Beneficiary</option>
                {beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>{b.full_name}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Distribution Date *</label>
              <input
                type="date"
                value={formData.distribution_date}
                onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Number of Pads *</label>
              <input
                type="number"
                value={formData.num_pads}
                onChange={(e) => setFormData({ ...formData, num_pads: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className={styles.field}>
              <label>Transport Mode *</label>
              <select
                value={formData.transport_mode}
                onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
              >
                <option value="pickup">Pickup</option>
                <option value="dispatch">Dispatch</option>
              </select>
            </div>
            {formData.transport_mode === 'dispatch' && (
              <div className={styles.field}>
                <label>Delivery Address</label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  rows={2}
                />
              </div>
            )}
            <div className={styles.field}>
              <label>Delivery Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.delivery_cost}
                onChange={(e) => setFormData({ ...formData, delivery_cost: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              {editingId ? 'Update' : 'Create'} Distribution
            </button>
          </form>
        )}

        {distributions.length === 0 ? (
          <EmptyRecord message="No distributions yet" onReload={loadData} theme={theme} />
        ) : (
          distributions.map(dist => (
            <div key={dist.id} className={`${styles.card} ${styles[`card_${theme}`]}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{dist.beneficiary?.full_name}</h3>
                  <p className={styles.date}>{new Date(dist.distribution_date).toLocaleDateString()}</p>
                </div>
                <div className={styles.cardActions}>
                  <span className={`${styles.badge} ${styles[dist.status]}`}>{dist.status}</span>
                  {canCreate && (
                    <>
                      <button onClick={() => handleEdit(dist)} className={styles.editBtn} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      {canDelete && (
                        <button onClick={() => handleDelete(dist.id)} className={styles.deleteBtn} title="Delete">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className={styles.details}>
                <p><strong>Pads:</strong> {dist.num_pads}</p>
                <p><strong>Mode:</strong> {dist.transport_mode}</p>
                <p><strong>Delivery Cost:</strong> ${dist.delivery_cost.toFixed(2)}</p>
                {dist.notes && <p><strong>Notes:</strong> {dist.notes}</p>}
              </div>
              {dist.status === 'pending' && canCreate && (
                <div className={styles.statusActions}>
                  <button onClick={() => updateStatus(dist.id, 'in_transit')} className={styles.statusBtn}>
                    Mark In Transit
                  </button>
                  <button onClick={() => updateStatus(dist.id, 'completed')} className={styles.statusBtn}>
                    Mark Completed
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
