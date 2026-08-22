import { useState } from 'react';
import { aiAnalyzerApi } from '../api/client.js';

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '24px',
    border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0, display: 'flex', alignItems: 'center', gap: 8 },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', minHeight: 180, padding: '12px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
  },
  btn: {
    padding: '12px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'transform 0.15s',
  },
  scoreRow: { display: 'flex', gap: 16, alignItems: 'center', margin: '16px 0' },
  scoreBadge: (score) => ({
    width: 90, height: 90, borderRadius: '50%',
    background: `conic-gradient(#6366f1 ${score * 3.6}deg, rgba(148,163,184,0.1) 0deg)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  scoreInner: {
    width: 74, height: 74, borderRadius: '50%', background: '#1e293b',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 20, color: '#a78bfa',
  },
  scoreLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 500 },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tagMatched: {
    fontSize: 12, fontWeight: 600, color: '#34d399', background: 'rgba(16,185,129,0.15)',
    borderRadius: 6, padding: '4px 10px', border: '1px solid rgba(16,185,129,0.2)',
  },
  tagMissing: {
    fontSize: 12, fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.15)',
    borderRadius: 6, padding: '4px 10px', border: '1px solid rgba(239,68,68,0.2)',
  },
  recsList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
  recItem: {
    fontSize: 13, color: '#cbd5e1', background: 'rgba(15,23,42,0.5)',
    borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #6366f1',
  },
  loading: { fontSize: 14, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 },
  error: { color: '#f87171', fontSize: 14, background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8 },
};

export default function AIAnalyzerPage() {
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiAnalyzerApi.analyzeMatch({ targetRole, jobDescription });
      setAnalysis(res.data?.analysis || null);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🤖 AI Resume Match & ATS Analyzer</h1>
      <p style={styles.subtitle}>Paste a job description to score your resume compatibility and get instant ATS optimization fixes.</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📄 Job Target Input</h2>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Target Role</label>
              <input
                style={styles.input}
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
                id="ai-target-role-input"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Job Description</label>
              <textarea
                style={styles.textarea}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste job posting description here (requirements, responsibilities, skills)..."
                required
                id="ai-job-desc-input"
              />
            </div>
            <button type="submit" style={styles.btn} disabled={loading} id="ai-analyze-btn">
              {loading ? '⚡ Analyzing...' : '🔍 Analyze Resume Match'}
            </button>
            {error && <div style={styles.error}>{error}</div>}
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Analysis Report</h2>
          {!analysis && !loading && (
            <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', margin: 'auto' }}>
              Enter target role and job description to generate your match report.
            </div>
          )}

          {loading && <div style={styles.loading}>⏳ Running AI keyword matching and ATS checks...</div>}

          {analysis && (
            <div>
              <div style={styles.scoreRow}>
                <div style={styles.scoreBadge(analysis.matchPercentage)}>
                  <div style={styles.scoreInner}>
                    {analysis.matchPercentage}%
                    <span style={styles.scoreLabel}>MATCH</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{analysis.targetRole}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                    ATS Score: <strong style={{ color: '#34d399' }}>{analysis.atsScore}/100</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Matched Keywords ({analysis.matchedKeywords?.length || 0})</span>
                <div style={styles.tagGrid}>
                  {(analysis.matchedKeywords || []).map((k, i) => (
                    <span key={i} style={styles.tagMatched}>✓ {k}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Missing Keywords ({analysis.missingKeywords?.length || 0})</span>
                <div style={styles.tagGrid}>
                  {(analysis.missingKeywords || []).map((k, i) => (
                    <span key={i} style={styles.tagMissing}>+ {k}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>Actionable Fix Checklist</span>
                <div style={styles.recsList}>
                  {(analysis.recommendations || []).map((rec, i) => (
                    <div key={i} style={styles.recItem}>💡 {rec}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
