'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { CycleLog } from '@/models/CycleLog';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useDemandState } from '@/lib/state-stack';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function CyclePage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [cycles, demandCycles, setCycles] = useDemandState<CycleLog[]>([], {
    key: 'cycle-logs',
    persist: true,
    ttl: 300
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    flow_intensity: 'moderate',
    feelings: '',
    mood: '',
    notes: '',
  });

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      await demandCycles(async ({ set }) => {
        const { data, error } = await supabaseBrowser
          .from('cycle_logs')
          .select('*')
          .eq('beneficiary_id', user.id)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error loading cycles:', error.message || error);
          return;
        }

        set(data?.map(d => CycleLog.from(d)) || []);
      });
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

    if (editingId) {
      await supabaseBrowser.from('cycle_logs').update({
        ...formData,
        status: formData.end_date ? 'closed' : 'open',
      }).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabaseBrowser.from('cycle_logs').insert({
        beneficiary_id: user.id,
        ...formData,
        status: formData.end_date ? 'closed' : 'open',
      });
    }

    setShowForm(false);
    setFormData({ start_date: '', end_date: '', flow_intensity: 'moderate', feelings: '', mood: '', notes: '' });
    
    // Fetch fresh data and update state
    const { data } = await supabaseBrowser
      .from('cycle_logs')
      .select('*')
      .eq('beneficiary_id', user.id)
      .order('start_date', { ascending: false });
    
    setCycles(data?.map(d => CycleLog.from(d)) || []);
  };

  const handleEdit = (cycle: CycleLog) => {
    setEditingId(cycle.id);
    setFormData({
      start_date: cycle.startDate,
      end_date: cycle.endDate || '',
      flow_intensity: cycle.flowIntensity || 'moderate',
      feelings: (cycle as any).feelings || '',
      mood: (cycle as any).mood || '',
      notes: cycle.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cycle log?')) return;
    await supabaseBrowser.from('cycle_logs').delete().eq('id', id);
    loadCycles();
  };

  return (
    <main className={`${styles.container} ${styles[`container_${theme}`]}`}>
      <div className={styles.content}>
        <div className={styles.topSection}>
          <h1 className={styles.title}>Cycle Tracking</h1>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            {showForm ? 'Cancel' : '+ Log Period'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Flow Intensity</label>
              <select
                value={formData.flow_intensity}
                onChange={(e) => setFormData({ ...formData, flow_intensity: e.target.value })}
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Mood</label>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              >
                <option value="">Select mood</option>
                <option value="happy">Happy</option>
                <option value="normal">Normal</option>
                <option value="sad">Sad</option>
                <option value="anxious">Anxious</option>
                <option value="irritable">Irritable</option>
                <option value="tired">Tired</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Feelings</label>
              <textarea
                value={formData.feelings}
                onChange={(e) => setFormData({ ...formData, feelings: e.target.value })}
                placeholder="How are you feeling?"
                rows={2}
              />
            </div>
            <div className={styles.field}>
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <button type="submit" className={styles.submitButton}>{editingId ? 'Update Log' : 'Save Log'}</button>
          </form>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : cycles.length === 0 ? (
          <EmptyRecord message="No cycle logs yet" onReload={loadCycles} theme={theme} />
        ) : (
          cycles.map(cycle => (
            <div key={cycle.id} className={`${styles.card} ${styles[`card_${theme}`]}`}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>{new Date(cycle.startDate).toLocaleDateString()}</span>
                <div className={styles.cardActions}>
                  <span className={`${styles.badge} ${styles[cycle.status]}`}>{cycle.status}</span>
                  <button onClick={() => handleEdit(cycle)} className={styles.editBtn} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(cycle.id)} className={styles.deleteBtn} title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.details}>
                <p><strong>End:</strong> {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : 'Ongoing'}</p>
                <p><strong>Flow:</strong> {cycle.flowIntensity}</p>
                {(cycle as any).mood && <p><strong>Mood:</strong> {(cycle as any).mood}</p>}
                {(cycle as any).feelings && <p><strong>Feelings:</strong> {(cycle as any).feelings}</p>}
                {cycle.notes && <p><strong>Notes:</strong> {cycle.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
