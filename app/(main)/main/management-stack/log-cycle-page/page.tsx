'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function LogCyclePage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    beneficiary_id: '',
    start_date: '',
    end_date: '',
    flow_intensity: 'moderate',
    mood: '',
    feelings: '',
    notes: '',
  });

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    const { data } = await supabaseBrowser
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'beneficiary')
      .order('full_name');

    setBeneficiaries(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabaseBrowser.from('cycle_logs').insert({
      beneficiary_id: formData.beneficiary_id,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      flow_intensity: formData.flow_intensity,
      mood: formData.mood || null,
      feelings: formData.feelings || null,
      notes: formData.notes || null,
      status: formData.end_date ? 'closed' : 'open',
    });

    if (error) {
      alert('Error logging cycle: ' + error.message);
      return;
    }

    alert('Cycle logged successfully!');
    setFormData({
      beneficiary_id: '',
      start_date: '',
      end_date: '',
      flow_intensity: 'moderate',
      mood: '',
      feelings: '',
      notes: '',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className={`${styles.container} ${styles[`container_${theme}`]}`}>
      <header className={`${styles.header} ${styles[`header_${theme}`]}`}>
        <div className={styles.headerContent}>
          <button className={styles.backButton} onClick={() => nav.pop()}>
            <svg className={styles.backIcon} viewBox="0 0 16 22" fill="none">
              <path d="M10.0424 0.908364L1.01887 8.84376C0.695893 9.12721 0.439655 9.46389 0.264823 9.83454C0.089992 10.2052 0 10.6025 0 11.0038C0 11.405 0.089992 11.8024 0.264823 12.173C0.439655 12.5437 0.695893 12.8803 1.01887 13.1638L10.0424 21.0992C12.2373 23.0294 16 21.6507 16 18.9239V3.05306C16 0.326231 12.2373 -1.02187 10.0424 0.908364Z" fill="currentColor" />
            </svg>
          </button>
          <h1 className={styles.title}>Log Cycle</h1>
        </div>
      </header>

      <div className={styles.body}>
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
              placeholder="How is the beneficiary feeling?"
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

          <button type="submit" className={styles.submitButton}>
            Log Cycle
          </button>
        </form>
      </div>
    </main>
  );
}
