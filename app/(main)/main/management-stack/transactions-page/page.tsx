'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import styles from './page.module.css';

export default function TransactionsPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'purchases',
    amount_given: '',
    amount_spent: '',
    date_of_allocation: '',
    date_of_expenditure: '',
    notes: '',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const { data } = await supabaseBrowser
      .from('expense_records')
      .select('*')
      .order('created_at', { ascending: false });

    setTransactions(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    const { error } = await supabaseBrowser.from('expense_records').insert({
      category: formData.category,
      amount_given: parseFloat(formData.amount_given),
      amount_spent: parseFloat(formData.amount_spent),
      date_of_allocation: formData.date_of_allocation,
      date_of_expenditure: formData.date_of_expenditure || null,
      notes: formData.notes || null,
      recorded_by: user.id,
      source: 'manual',
    });

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    setShowForm(false);
    setFormData({
      category: 'purchases',
      amount_given: '',
      amount_spent: '',
      date_of_allocation: '',
      date_of_expenditure: '',
      notes: '',
    });
    loadTransactions();
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
          <h1 className={styles.title}>Transactions</h1>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            {showForm ? 'Cancel' : '+ New'}
          </button>
        </div>
      </header>

      <div className={styles.innerBody}>
        {showForm && (
          <form onSubmit={handleSubmit} className={`${styles.form} ${styles[`form_${theme}`]}`}>
            <div className={styles.field}>
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="purchases">Pad Purchases</option>
                <option value="distribution">Distribution Costs</option>
                <option value="salaries">Salaries</option>
                <option value="others">Others (Supplies, Fuel, etc.)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Amount Given *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount_given}
                onChange={(e) => setFormData({ ...formData, amount_given: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Amount Spent *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount_spent}
                onChange={(e) => setFormData({ ...formData, amount_spent: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Date of Allocation *</label>
              <input
                type="date"
                value={formData.date_of_allocation}
                onChange={(e) => setFormData({ ...formData, date_of_allocation: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Date of Expenditure</label>
              <input
                type="date"
                value={formData.date_of_expenditure}
                onChange={(e) => setFormData({ ...formData, date_of_expenditure: e.target.value })}
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
              Create Transaction
            </button>
          </form>
        )}

        {transactions.length === 0 ? (
          <EmptyRecord message="No transactions yet" onReload={loadTransactions} theme={theme} />
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className={`${styles.card} ${styles[`card_${theme}`]}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{tx.category}</h3>
                  <p className={styles.date}>{new Date(tx.date_of_allocation).toLocaleDateString()}</p>
                </div>
                <div className={styles.amount}>${tx.amount_spent.toFixed(2)}</div>
              </div>
              <div className={styles.details}>
                <p><strong>Given:</strong> ${tx.amount_given.toFixed(2)}</p>
                <p><strong>Spent:</strong> ${tx.amount_spent.toFixed(2)}</p>
                <p><strong>Balance:</strong> ${tx.remaining_balance.toFixed(2)}</p>
                {tx.notes && <p><strong>Notes:</strong> {tx.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
