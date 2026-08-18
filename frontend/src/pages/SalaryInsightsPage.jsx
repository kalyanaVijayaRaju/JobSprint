import { useState, useEffect, useCallback } from 'react';
import { salaryInsightsApi } from '../api/client.js';

const LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const LEVEL_LABELS = { entry: 'Entry', mid: 'Mid', senior: 'Senior', lead: 'Lead', executive: 'Executive' };
const LEVEL_COLORS = { entry: '#6366f1', mid: '#3b82f6', senior: '#10b981', lead: '#f59e0b', executive: '#ef4444' };

const formatSalary = (v) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  searchRow: {
    display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28,
    padding: '20px', background: 'rgba(30,41,59,0.6)', borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.1)',
  },
  input: {
    flex: '1 1 180px', padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none',
  },
  select: {
    padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none', minWidth: 140,
  },
  btn: {
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'transform 0.15s',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '20px 22px',
    border: '1px solid rgba(148,163,184,0.1)', transition: 'border-color 0.2s',
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' },
  cardLocation: { fontSize: 13, color: '#94a3b8', margin: '0 0 16px' },
  rangeBar: { height: 8, borderRadius: 4, background: 'rgba(148,163,184,0.1)', margin: '8px 0', position: 'relative', overflow: 'hidden' },
  rangeFill: (pct, color) => ({
    position: 'absolute', top: 0, left: 0, height: '100%',
    width: `${pct}%`, borderRadius: 4,
    background: `linear-gradient(90deg, ${color}88, ${color})`,
    transition: 'width 0.3s ease',
  }),
  rangeLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  medianLabel: (pct) => ({
    position: 'absolute', top: -22, fontSize: 12, fontWeight: 700, color: '#f1f5f9',
    left: `${pct}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap',
  }),
  levelBadge: (color) => ({
    fontSize: 11, fontWeight: 600, color, background: `${color}1a`,
    borderRadius: 8, padding: '3px 10px', display: 'inline-block', marginBottom: 12,
  }),
  aggregate: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
    borderRadius: 16, padding: '24px', marginBottom: 28,
    border: '1px solid rgba(99,102,241,0.15)',
  },
  aggTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px' },
  aggRow: { display: 'flex', gap: 32, flexWrap: 'wrap' },
  aggItem: { textAlign: 'center' },
  aggNum: { fontSize: 24, fontWeight: 800, color: '#a78bfa', display: 'block' },
  aggLabel: { fontSize: 12, color: '#94a3b8' },
  trendSection: { marginTop: 32 },
  trendTitle: { fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 },
  trendTable: {
    width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px',
  },
  th: { fontSize: 12, fontWeight: 600, color: '#94a3b8', textAlign: 'left', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  td: { padding: '12px 16px', fontSize: 14, color: '#e2e8f0', background: 'rgba(30,41,59,0.5)', },
  tdFirst: { borderRadius: '10px 0 0 10px' },
  tdLast: { borderRadius: '0 10px 10px 0' },
  reportForm: {
    background: 'rgba(30,41,59,0.6)', borderRadius: 16, padding: '24px',
    border: '1px solid rgba(148,163,184,0.1)', marginTop: 32, maxWidth: 600,
  },
  formTitle: { fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  empty: { textAlign: 'center', padding: 60, color: '#64748b', fontSize: 15 },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8' },
};

export default function SalaryInsightsPage() {
  const [results, setResults] = useState([]);
  const [aggregate, setAggregate] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ jobTitle: '', location: '', experienceLevel: '' });
  const [searched, setSearched] = useState(false);

  const [reportForm, setReportForm] = useState({
    jobTitle: '', location: '', experienceLevel: 'mid',
    minSalary: '', maxSalary: '', industry: 'Technology',
  });
  const [reportMsg, setReportMsg] = useState('');

  const handleSearch = useCallback(async () => {
    if (!filters.jobTitle && !filters.location) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await salaryInsightsApi.search(filters);
      setResults(res.data?.results || []);
      setAggregate(res.data?.aggregate || null);

      if (filters.jobTitle) {
        const tRes = await salaryInsightsApi.getTrends(filters.jobTitle);
        setTrends(tRes.data?.trends || []);
      }
    } catch {
      setResults([]);
      setAggregate(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await salaryInsightsApi.submitReport({
        ...reportForm,
        minSalary: Number(reportForm.minSalary),
        maxSalary: Number(reportForm.maxSalary),
      });
      setReportMsg('✅ Salary report submitted anonymously! Thank you.');
      setReportForm({ jobTitle: '', location: '', experienceLevel: 'mid', minSalary: '', maxSalary: '', industry: 'Technology' });
    } catch {
      setReportMsg('❌ Failed to submit report.');
    }
  };

  const maxSalaryInResults = results.length ? Math.max(...results.map(r => r.maxSalary)) : 1;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>💰 Salary Insights</h1>
      <p style={styles.subtitle}>Research salary ranges by job title, location, and experience level</p>

      <div style={styles.searchRow}>
        <input
          style={styles.input}
          placeholder="Job title (e.g. Software Engineer)"
          value={filters.jobTitle}
          onChange={e => setFilters(f => ({ ...f, jobTitle: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          id="salary-search-title"
        />
        <input
          style={styles.input}
          placeholder="Location (e.g. Bangalore)"
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          id="salary-search-location"
        />
        <select
          style={styles.select}
          value={filters.experienceLevel}
          onChange={e => setFilters(f => ({ ...f, experienceLevel: e.target.value }))}
          id="salary-search-level"
        >
          <option value="">All Levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
        </select>
        <button style={styles.btn} onClick={handleSearch} id="salary-search-btn">
          🔍 Search
        </button>
      </div>

      {loading && <div style={styles.loading}>⏳ Searching salary data...</div>}

      {!loading && aggregate && (
        <div style={styles.aggregate}>
          <h3 style={styles.aggTitle}>📊 Aggregate Overview</h3>
          <div style={styles.aggRow}>
            <div style={styles.aggItem}>
              <span style={styles.aggNum}>{formatSalary(aggregate.avgMin)}</span>
              <span style={styles.aggLabel}>Avg Min</span>
            </div>
            <div style={styles.aggItem}>
              <span style={{ ...styles.aggNum, color: '#34d399' }}>{formatSalary(aggregate.avgMedian)}</span>
              <span style={styles.aggLabel}>Avg Median</span>
            </div>
            <div style={styles.aggItem}>
              <span style={{ ...styles.aggNum, color: '#f59e0b' }}>{formatSalary(aggregate.avgMax)}</span>
              <span style={styles.aggLabel}>Avg Max</span>
            </div>
            <div style={styles.aggItem}>
              <span style={{ ...styles.aggNum, color: '#6366f1' }}>{aggregate.count}</span>
              <span style={styles.aggLabel}>Data Points</span>
            </div>
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={styles.grid}>
          {results.map((r, i) => {
            const pct = (r.maxSalary / maxSalaryInResults) * 100;
            const medianPct = (r.medianSalary / r.maxSalary) * 100;
            const lvlColor = LEVEL_COLORS[r.experienceLevel] || '#6366f1';
            return (
              <div key={i} style={styles.card}>
                <span style={styles.levelBadge(lvlColor)}>
                  {LEVEL_LABELS[r.experienceLevel] || r.experienceLevel}
                </span>
                <h3 style={styles.cardTitle}>{r.jobTitle}</h3>
                <p style={styles.cardLocation}>📍 {r.location} • {r.industry}</p>
                <div style={styles.rangeLabels}>
                  <span>{formatSalary(r.minSalary)}</span>
                  <span>{formatSalary(r.maxSalary)}</span>
                </div>
                <div style={{ ...styles.rangeBar, position: 'relative' }}>
                  <div style={styles.rangeFill(pct, lvlColor)} />
                  <div style={styles.medianLabel(medianPct)}>
                    ◆ {formatSalary(r.medianSalary)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={styles.empty}>No salary data found. Try different search terms or submit your own!</div>
      )}

      {!loading && trends.length > 0 && (
        <div style={styles.trendSection}>
          <h2 style={styles.trendTitle}>📈 Salary Progression by Experience</h2>
          <table style={styles.trendTable}>
            <thead>
              <tr>
                <th style={styles.th}>Level</th>
                <th style={styles.th}>Avg Min</th>
                <th style={styles.th}>Avg Median</th>
                <th style={styles.th}>Avg Max</th>
                <th style={styles.th}>Reports</th>
              </tr>
            </thead>
            <tbody>
              {trends.map(t => (
                <tr key={t.level}>
                  <td style={{ ...styles.td, ...styles.tdFirst }}>
                    <span style={styles.levelBadge(LEVEL_COLORS[t.level] || '#6366f1')}>
                      {LEVEL_LABELS[t.level] || t.level}
                    </span>
                  </td>
                  <td style={styles.td}>{formatSalary(t.avgMin)}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#34d399' }}>{formatSalary(t.avgMedian)}</td>
                  <td style={styles.td}>{formatSalary(t.avgMax)}</td>
                  <td style={{ ...styles.td, ...styles.tdLast }}>{t.reportCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.reportForm}>
        <h3 style={styles.formTitle}>📝 Submit Your Salary (Anonymous)</h3>
        <form onSubmit={handleReport}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title</label>
              <input style={styles.input} value={reportForm.jobTitle}
                onChange={e => setReportForm(f => ({ ...f, jobTitle: e.target.value }))} required id="report-title" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input style={styles.input} value={reportForm.location}
                onChange={e => setReportForm(f => ({ ...f, location: e.target.value }))} required id="report-location" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Experience Level</label>
              <select style={styles.select} value={reportForm.experienceLevel}
                onChange={e => setReportForm(f => ({ ...f, experienceLevel: e.target.value }))} id="report-level">
                {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Industry</label>
              <input style={styles.input} value={reportForm.industry}
                onChange={e => setReportForm(f => ({ ...f, industry: e.target.value }))} id="report-industry" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Min Salary (₹/year)</label>
              <input style={styles.input} type="number" value={reportForm.minSalary}
                onChange={e => setReportForm(f => ({ ...f, minSalary: e.target.value }))} required id="report-min" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Max Salary (₹/year)</label>
              <input style={styles.input} type="number" value={reportForm.maxSalary}
                onChange={e => setReportForm(f => ({ ...f, maxSalary: e.target.value }))} required id="report-max" />
            </div>
          </div>
          <button type="submit" style={{ ...styles.btn, marginTop: 16, width: '100%' }} id="report-submit-btn">
            Submit Anonymously
          </button>
          {reportMsg && <p style={{ marginTop: 12, fontSize: 14, color: reportMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>{reportMsg}</p>}
        </form>
      </div>
    </div>
  );
}
