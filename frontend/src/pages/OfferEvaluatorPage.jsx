import { useState } from 'react';
import { offerEvaluatorApi } from '../api/client.js';

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '24px',
    border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  input: {
    padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: 14, outline: 'none',
  },
  btn: {
    padding: '12px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
  compRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' },
  compLabel: { fontSize: 13, color: '#cbd5e1' },
  compVal: { fontSize: 14, fontWeight: 700, color: '#f1f5f9' },
  ratingBadge: (rating) => ({
    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
    background: rating === 'exceptional' ? 'rgba(34,197,94,0.2)' : rating === 'competitive' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)',
    color: rating === 'exceptional' ? '#22c55e' : rating === 'competitive' ? '#60a5fa' : '#f59e0b',
    border: `1px solid ${rating === 'exceptional' ? 'rgba(34,197,94,0.3)' : rating === 'competitive' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
    display: 'inline-block', marginBottom: 12,
  }),
  letterTextarea: {
    width: '100%', minHeight: 180, padding: '14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box',
  },
};

export default function OfferEvaluatorPage() {
  const [form, setForm] = useState({
    jobTitle: 'Software Engineer', companyName: 'Acme Corp', location: 'Bangalore',
    baseSalary: '1800000', bonus: '200000', equityValue: '300000', benefitsValue: '100000',
  });
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await offerEvaluatorApi.evaluate(form);
      setEvaluation(res.data?.evaluation || null);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const formatRupees = (num) => `₹${Number(num).toLocaleString('en-IN')}`;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>💵 Job Offer Evaluator & Negotiation Helper</h1>
      <p style={styles.subtitle}>Evaluate total compensation packages against regional market standards and generate customized counter-offer letters.</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📥 Enter Offer Details</h2>
          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Job Title</label>
              <input style={styles.input} value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} required id="offer-title-input" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Company Name</label>
              <input style={styles.input} value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} required id="offer-company-input" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Location</label>
              <input style={styles.input} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required id="offer-location-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Base Salary (₹/year)</label>
                <input style={styles.input} type="number" value={form.baseSalary} onChange={e => setForm(f => ({ ...f, baseSalary: e.target.value }))} required id="offer-base-input" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Bonus (₹/year)</label>
                <input style={styles.input} type="number" value={form.bonus} onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))} id="offer-bonus-input" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Equity / ESOP (₹/year)</label>
                <input style={styles.input} type="number" value={form.equityValue} onChange={e => setForm(f => ({ ...f, equityValue: e.target.value }))} id="offer-equity-input" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Benefits Value (₹/year)</label>
                <input style={styles.input} type="number" value={form.benefitsValue} onChange={e => setForm(f => ({ ...f, benefitsValue: e.target.value }))} id="offer-benefits-input" />
              </div>
            </div>
            <button type="submit" style={styles.btn} disabled={loading} id="evaluate-offer-btn">
              {loading ? 'Evaluating...' : '📊 Evaluate Compensation Package'}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📈 Offer Benchmarking Report</h2>
          {!evaluation && (
            <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', margin: 'auto' }}>
              Fill in your offer breakdown to calculate market percentile and counter-offer letter.
            </div>
          )}

          {evaluation && (
            <div>
              <span style={styles.ratingBadge(evaluation.scoreRating)}>
                {evaluation.scoreRating} offer
              </span>

              <div style={{ background: 'rgba(15,23,42,0.5)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <div style={styles.compRow}>
                  <span style={styles.compLabel}>Base Salary</span>
                  <span style={styles.compVal}>{formatRupees(evaluation.baseSalary)}</span>
                </div>
                <div style={styles.compRow}>
                  <span style={styles.compLabel}>Performance Bonus</span>
                  <span style={styles.compVal}>{formatRupees(evaluation.bonus)}</span>
                </div>
                <div style={styles.compRow}>
                  <span style={styles.compLabel}>Equity / Stocks</span>
                  <span style={styles.compVal}>{formatRupees(evaluation.equityValue)}</span>
                </div>
                <div style={{ ...styles.compRow, borderBottom: 'none', paddingTop: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>Total Compensation</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{formatRupees(evaluation.totalCompensation)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>✉️ Negotiation Counter-Offer Email</span>
                <textarea style={styles.letterTextarea} value={evaluation.counterLetterText} readOnly id="counter-letter-box" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
