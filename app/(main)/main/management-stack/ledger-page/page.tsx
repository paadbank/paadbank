'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function LedgerPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    // Get expense records
    const { data: expenses } = await supabaseBrowser
      .from('expense_records')
      .select('*')
      .order('created_at', { ascending: false });

    // Get distribution delivery costs
    const { data: distributions } = await supabaseBrowser
      .from('distributions')
      .select('*, beneficiary:profiles!beneficiary_id(full_name), distributor:profiles!distributor_id(full_name)')
      .order('created_at', { ascending: false });

    // Combine into ledger
    const combined = [
      ...(expenses || []).map(e => ({
        ...e,
        type: 'expense',
        date: e.date_of_allocation,
        amount: e.amount_spent,
      })),
      ...(distributions || []).map(d => ({
        ...d,
        type: 'delivery',
        date: d.distribution_date,
        amount: d.delivery_cost,
        category: 'distribution',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setLedger(combined);
    setLoading(false);
  };

  const filteredLedger = filter === 'all' 
    ? ledger 
    : ledger.filter(item => item.category === filter);

  const totalExpenses = ledger
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDelivery = ledger
    .filter(item => item.type === 'delivery')
    .reduce((sum, item) => sum + item.amount, 0);

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
          <h1 className={styles.title}>Ledger</h1>
        </div>
      </header>

      <div className={styles.innerBody}>
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Expenses</div>
            <div className={styles.summaryAmount}>${totalExpenses.toFixed(2)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Delivery Costs</div>
            <div className={styles.summaryAmount}>${totalDelivery.toFixed(2)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Grand Total</div>
            <div className={styles.summaryAmount}>${(totalExpenses + totalDelivery).toFixed(2)}</div>
          </div>
        </div>

        <div className={styles.filters}>
          <button onClick={() => setFilter('all')} className={`${styles.filter} ${filter === 'all' ? styles.filterActive : ''}`}>
            All
          </button>
          <button onClick={() => setFilter('purchases')} className={`${styles.filter} ${filter === 'purchases' ? styles.filterActive : ''}`}>
            Purchases
          </button>
          <button onClick={() => setFilter('distribution')} className={`${styles.filter} ${filter === 'distribution' ? styles.filterActive : ''}`}>
            Distribution
          </button>
          <button onClick={() => setFilter('salaries')} className={`${styles.filter} ${filter === 'salaries' ? styles.filterActive : ''}`}>
            Salaries
          </button>
        </div>

        {filteredLedger.map((item, idx) => (
          <div key={idx} className={`${styles.card} ${styles[`card_${theme}`]}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3>{item.type === 'delivery' ? `Delivery - ${item.beneficiary?.full_name}` : item.category}</h3>
                <p className={styles.date}>{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className={styles.amount}>${item.amount.toFixed(2)}</div>
            </div>
            {item.notes && <p className={styles.notes}>{item.notes}</p>}
            {item.type === 'delivery' && (
              <p className={styles.meta}>Distributor: {item.distributor?.full_name}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
