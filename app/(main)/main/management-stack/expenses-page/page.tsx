'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useDemandState } from '@/lib/state-stack';
import EmptyRecord from '@/components/EmptyRecord/EmptyRecord';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function ExpensesPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [expenses, demandExpenses, setExpenses] = useDemandState<any[]>([], {
    key: 'expenses',
    persist: true,
    ttl: 300
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    category: 'purchases',
    amount_given: '',
    amount_spent: '',
    date_of_allocation: '',
    date_of_expenditure: '',
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

      await demandExpenses(async ({ set }) => {
        const { data } = await supabaseBrowser
          .from('expense_records')
          .select('*, recorded_by_profile:profiles!recorded_by(full_name)')
          .order('created_at', { ascending: false });

        set(data || []);
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

    const payload = {
      ...formData,
      amount_given: parseFloat(formData.amount_given),
      amount_spent: parseFloat(formData.amount_spent),
      recorded_by: user.id,
    };

    if (editingId) {
      await supabaseBrowser.from('expense_records').update(payload).eq('id', editingId);
    } else {
      await supabaseBrowser.from('expense_records').insert(payload);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      category: 'purchases',
      amount_given: '',
      amount_spent: '',
      date_of_allocation: '',
      date_of_expenditure: '',
      notes: '',
    });

    const { data } = await supabaseBrowser
      .from('expense_records')
      .select('*, recorded_by_profile:profiles!recorded_by(full_name)')
      .order('created_at', { ascending: false });

    setExpenses(data || []);
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setFormData({
      category: expense.category,
      amount_given: expense.amount_given.toString(),
      amount_spent: expense.amount_spent.toString(),
      date_of_allocation: expense.date_of_allocation,
      date_of_expenditure: expense.date_of_expenditure || '',
      notes: expense.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense record?')) return;
    await supabaseBrowser.from('expense_records').delete().eq('id', id);
    
    const { data } = await supabaseBrowser
      .from('expense_records')
      .select('*, recorded_by_profile:profiles!recorded_by(full_name)')
      .order('created_at', { ascending: false });

    setExpenses(data || []);
  };

  if (loading) return <LoadingSpinner />;

  const canDelete = userRole === 'admin';
  const canCreate = ['sales', 'manager', 'admin'].includes(userRole);

  const totalGiven = expenses.reduce((sum, e) => sum + Number(e.amount_given), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount_spent), 0);
  const balance = totalGiven - totalSpent;

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
            <h1 className={styles.title}>Expenses</h1>
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

        <div className={styles.summary}>
          <div className={`${styles.summaryCard} ${styles[`summaryCard_${theme}`]}`}>
            <span className={styles.summaryLabel}>Total Given</span>
            <span className={styles.summaryValue}>${totalGiven.toFixed(2)}</span>
          </div>
          <div className={`${styles.summaryCard} ${styles[`summaryCard_${theme}`]}`}>
            <span className={styles.summaryLabel}>Total Spent</span>
            <span className={styles.summaryValue}>${totalSpent.toFixed(2)}</span>
          </div>
          <div className={`${styles.summaryCard} ${styles[`summaryCard_${theme}`]}`}>
            <span className={styles.summaryLabel}>Balance</span>
            <span className={`${styles.summaryValue} ${balance < 0 ? styles.negative : styles.positive}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={`${styles.form} ${styles[`form_${theme}`]}`}>
            <div className={styles.field}>
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="purchases">Purchases</option>
                <option value="distribution">Distribution</option>
                <option value="salaries">Salaries</option>
                <option value="others">Others</option>
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
                min="0"
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
                min="0"
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
              {editingId ? 'Update' : 'Create'} Expense
            </button>
          </form>
        )}

        {expenses.length === 0 ? (
          <EmptyRecord message="No expense records yet" onReload={loadData} theme={theme} />
        ) : (
          expenses.map(expense => (
            <div key={expense.id} className={`${styles.card} ${styles[`card_${theme}`]}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{expense.category}</h3>
                  <p className={styles.date}>{new Date(expense.date_of_allocation).toLocaleDateString()}</p>
                </div>
                <div className={styles.cardActions}>
                  <span className={`${styles.badge} ${styles[expense.category]}`}>{expense.category}</span>
                  {canCreate && (
                    <>
                      <button onClick={() => handleEdit(expense)} className={styles.editBtn} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      {canDelete && (
                        <button onClick={() => handleDelete(expense.id)} className={styles.deleteBtn} title="Delete">
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
                <p><strong>Given:</strong> ${expense.amount_given.toFixed(2)}</p>
                <p><strong>Spent:</strong> ${expense.amount_spent.toFixed(2)}</p>
                <p><strong>Balance:</strong> ${expense.remaining_balance.toFixed(2)}</p>
                <p><strong>Recorded by:</strong> {expense.recorded_by_profile?.full_name}</p>
                {expense.notes && <p><strong>Notes:</strong> {expense.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
