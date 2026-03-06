'use client';

import { useNav } from '@/lib/NavigationStack';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './page.module.css';

export default function ReportsPage() {
  const nav = useNav();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('distributions');
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = async () => {
    try {
      setLoading(true);

      if (reportType === 'distributions') {
        const { data: distData } = await supabaseBrowser
          .from('distributions')
          .select('*, beneficiary:profiles!beneficiary_id(full_name), distributor:profiles!distributor_id(full_name)')
          .order('created_at', { ascending: false });

        setData(distData || []);
        setStats({
          total: distData?.length || 0,
          pending: distData?.filter(d => d.status === 'pending').length || 0,
          completed: distData?.filter(d => d.status === 'completed').length || 0,
          totalPads: distData?.reduce((sum, d) => sum + d.num_pads, 0) || 0,
        });
      } else if (reportType === 'expenses') {
        const { data: expData } = await supabaseBrowser
          .from('expense_records')
          .select('*, recorded_by_profile:profiles!recorded_by(full_name)')
          .order('created_at', { ascending: false });

        setData(expData || []);
        setStats({
          total: expData?.length || 0,
          totalGiven: expData?.reduce((sum, e) => sum + Number(e.amount_given), 0) || 0,
          totalSpent: expData?.reduce((sum, e) => sum + Number(e.amount_spent), 0) || 0,
          balance: (expData?.reduce((sum, e) => sum + Number(e.amount_given), 0) || 0) - (expData?.reduce((sum, e) => sum + Number(e.amount_spent), 0) || 0),
        });
      } else if (reportType === 'users') {
        const { data: userData } = await supabaseBrowser
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        setData(userData || []);
        setStats({
          total: userData?.length || 0,
          beneficiaries: userData?.filter(u => u.role === 'beneficiary').length || 0,
          distributors: userData?.filter(u => u.role === 'distributor').length || 0,
          pending: userData?.filter(u => u.status === 'pending').length || 0,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <LoadingSpinner />;

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
            <h1 className={styles.title}>Reports</h1>
          </div>
          <button onClick={exportToCSV} className={styles.exportButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className={styles.exportButtonTextFull}>Export CSV</span>
            <span className={styles.exportButtonTextShort}>CSV</span>
          </button>
        </div>
      </header>

      <div className={styles.innerBody}>

        <div className={styles.tabs}>
          <button
            onClick={() => setReportType('distributions')}
            className={`${styles.tab} ${reportType === 'distributions' ? styles.active : ''}`}
          >
            Distributions
          </button>
          <button
            onClick={() => setReportType('expenses')}
            className={`${styles.tab} ${reportType === 'expenses' ? styles.active : ''}`}
          >
            Expenses
          </button>
          <button
            onClick={() => setReportType('users')}
            className={`${styles.tab} ${reportType === 'users' ? styles.active : ''}`}
          >
            Users
          </button>
        </div>

        <div className={styles.statsGrid}>
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className={`${styles.statCard} ${styles[`statCard_${theme}`]}`}>
              <span className={styles.statLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className={styles.statValue}>
                {typeof value === 'number' && key.includes('total') && !key.includes('Pads') ? `$${value.toFixed(2)}` : String(value)}
              </span>
            </div>
          ))}
        </div>

        <div className={`${styles.table} ${styles[`table_${theme}`]}`}>
          <div className={styles.tableHeader}>
            <h3>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
            <p>{data.length} records</p>
          </div>

          {reportType === 'distributions' && (
            <div className={styles.tableContent}>
              {data.map(item => (
                <div key={item.id} className={styles.tableRow}>
                  <div>
                    <strong>{item.beneficiary?.full_name}</strong>
                    <p>{new Date(item.distribution_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p>Pads: {item.num_pads}</p>
                    <p>Status: <span className={`${styles.badge} ${styles[item.status]}`}>{item.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reportType === 'expenses' && (
            <div className={styles.tableContent}>
              {data.map(item => (
                <div key={item.id} className={styles.tableRow}>
                  <div>
                    <strong>{item.category}</strong>
                    <p>{new Date(item.date_of_allocation).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p>Given: ${(item.amount_given || 0).toFixed(2)}</p>
                    <p>Spent: ${(item.amount_spent || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reportType === 'users' && (
            <div className={styles.tableContent}>
              {data.map(item => (
                <div key={item.id} className={styles.tableRow}>
                  <div>
                    <strong>{item.full_name}</strong>
                    <p>{item.email}</p>
                  </div>
                  <div>
                    <p>Role: <span className={`${styles.badge} ${styles[item.role]}`}>{item.role}</span></p>
                    <p>Status: <span className={`${styles.badge} ${styles[item.status]}`}>{item.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
