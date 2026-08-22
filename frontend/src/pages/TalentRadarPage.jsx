import { useState } from 'react';
import { talentRadarApi } from '../api/client.js';

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  searchCard: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '20px 24px',
    border: '1px solid rgba(148,163,184,0.1)', marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 },
  label: { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  input: {
    padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: 14, outline: 'none',
  },
  btn: {
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', height: 42,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '24px',
    border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 16,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  location: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  fitBadge: (score) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 800,
    background: score >= 80 ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
    color: score >= 80 ? '#22c55e' : '#a78bfa',
    border: `1px solid ${score >= 80 ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
  }),
  radarBox: {
    background: 'rgba(15,23,42,0.6)', borderRadius: 12, padding: '16px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  barRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 },
  barLabel: { color: '#cbd5e1', width: 120 },
  barTrack: { flex: 1, height: 6, background: 'rgba(148,163,184,0.1)', borderRadius: 3, overflow: 'hidden', margin: '0 8px' },
  barFill: (val, color) => ({ width: `${val}%`, height: '100%', background: color, borderRadius: 3 }),
  barVal: { color: '#f1f5f9', fontWeight: 700, width: 30, textAlign: 'right' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  badge: { fontSize: 11, color: '#a78bfa', background: 'rgba(99,102,241,0.1)', borderRadius: 6, padding: '3px 8px' },
};

export default function TalentRadarPage() {
  const [requiredSkills, setRequiredSkills] = useState('React, Node.js, System Design');
  const [minExperience, setMinExperience] = useState(2);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await talentRadarApi.search({ requiredSkills, minExperience });
      setResults(res.data?.results || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎯 Recruiter Talent Radar & Skill Matrix</h1>
      <p style={styles.subtitle}>Weight candidate profiles across technical skills, assessment metrics, experience level, and peer endorsements.</p>

      <form style={styles.searchCard} onSubmit={handleSearch}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Required Skills (comma separated)</label>
          <input style={styles.input} value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} id="radar-skills-input" />
        </div>
        <div style={{ ...styles.inputGroup, maxWidth: 160 }}>
          <label style={styles.label}>Min Experience (Years)</label>
          <input style={styles.input} type="number" value={minExperience} onChange={e => setMinExperience(e.target.value)} min={0} id="radar-exp-input" />
        </div>
        <button type="submit" style={styles.btn} disabled={loading} id="radar-search-btn">
          {loading ? 'Scanning...' : '⚡ Scan Radar Matrix'}
        </button>
      </form>

      {results.length > 0 && (
        <div style={styles.grid}>
          {results.map((c, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.header}>
                <div>
                  <h3 style={styles.name}>{c.name}</h3>
                  <p style={styles.location}>📍 {c.location} • {c.yearsOfExperience} yrs exp</p>
                </div>
                <div style={styles.fitBadge(c.overallFitScore)}>
                  {c.overallFitScore}% FIT
                </div>
              </div>

              <div style={styles.radarBox}>
                <div style={styles.barRow}>
                  <span style={styles.barLabel}>Tech Skills</span>
                  <div style={styles.barTrack}><div style={styles.barFill(c.radarMatrix.technicalSkills, '#6366f1')} /></div>
                  <span style={styles.barVal}>{c.radarMatrix.technicalSkills}%</span>
                </div>
                <div style={styles.barRow}>
                  <span style={styles.barLabel}>Assessments</span>
                  <div style={styles.barTrack}><div style={styles.barFill(c.radarMatrix.assessmentScore, '#34d399')} /></div>
                  <span style={styles.barVal}>{c.radarMatrix.assessmentScore}%</span>
                </div>
                <div style={styles.barRow}>
                  <span style={styles.barLabel}>Experience</span>
                  <div style={styles.barTrack}><div style={styles.barFill(c.radarMatrix.experienceScore, '#f59e0b')} /></div>
                  <span style={styles.barVal}>{c.radarMatrix.experienceScore}%</span>
                </div>
                <div style={styles.barRow}>
                  <span style={styles.barLabel}>Endorsements</span>
                  <div style={styles.barTrack}><div style={styles.barFill(c.radarMatrix.endorsementsScore, '#a78bfa')} /></div>
                  <span style={styles.barVal}>{c.radarMatrix.endorsementsScore}%</span>
                </div>
              </div>

              <div style={styles.tagGrid}>
                {(c.skills || []).map(s => <span key={s} style={styles.badge}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 60, fontSize: 14 }}>
          Click Scan Radar Matrix to analyze candidates against target skill weightings.
        </div>
      )}
    </div>
  );
}
