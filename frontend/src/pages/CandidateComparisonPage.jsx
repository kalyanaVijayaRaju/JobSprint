import { useState, useEffect } from 'react';
import { comparisonsApi } from '../api/client.js';

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  inputRow: {
    display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24,
    padding: '20px', background: 'rgba(30,41,59,0.6)', borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.1)', alignItems: 'flex-end',
  },
  input: {
    flex: '1 1 180px', padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none',
  },
  addBtn: {
    padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)',
    background: 'rgba(99,102,241,0.1)', color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  compareBtn: {
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  tags: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(99,102,241,0.15)', borderRadius: 8, padding: '4px 12px',
    fontSize: 12, color: '#a78bfa',
  },
  tagX: { cursor: 'pointer', color: '#f87171', fontWeight: 700 },
  compGrid: { display: 'grid', gap: 16 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '24px',
    border: '1px solid rgba(148,163,184,0.1)',
  },
  cardHeader: { marginBottom: 16 },
  cardName: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' },
  cardEmail: { fontSize: 13, color: '#94a3b8' },
  statRow: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 },
  stat: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(15,23,42,0.5)', borderRadius: 12, padding: '12px 20px', minWidth: 80,
  },
  statNum: (color) => ({ fontSize: 24, fontWeight: 800, color }),
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillBadge: (common) => ({
    fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6,
    background: common ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)',
    color: common ? '#34d399' : '#a78bfa',
    border: common ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,102,241,0.15)',
  }),
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' },
  assessmentRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  assessmentBadge: (passed) => ({
    fontSize: 12, padding: '4px 10px', borderRadius: 6,
    background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
    color: passed ? '#34d399' : '#f87171',
    border: `1px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
  }),
  endorsementSkill: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
    background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '3px 10px',
    color: '#fbbf24',
  },
  commonSection: {
    marginBottom: 24, padding: '16px 20px', borderRadius: 14,
    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
  },
  commonTitle: { fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 10 },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8' },
  error: { padding: 24, color: '#f87171', fontSize: 14, background: 'rgba(239,68,68,0.08)', borderRadius: 12 },
  empty: { textAlign: 'center', padding: 60, color: '#64748b', fontSize: 15 },
};

export default function CandidateComparisonPage() {
  const [candidateIds, setCandidateIds] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addCandidate = () => {
    const id = inputVal.trim();
    if (id && !candidateIds.includes(id) && candidateIds.length < 4) {
      setCandidateIds([...candidateIds, id]);
      setInputVal('');
    }
  };

  const removeCandidate = (id) => setCandidateIds(candidateIds.filter(c => c !== id));

  const handleCompare = async () => {
    if (candidateIds.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await comparisonsApi.compare(candidateIds);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const commonSkills = result?.commonSkills || [];
  const cols = result?.candidates?.length || 1;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚖️ Candidate Comparison</h1>
      <p style={styles.subtitle}>Compare 2-4 candidates side-by-side on skills, assessments, and endorsements</p>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Enter candidate user ID"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCandidate()}
          id="compare-candidate-input"
        />
        <button style={styles.addBtn} onClick={addCandidate} disabled={candidateIds.length >= 4} id="add-candidate-btn">
          + Add
        </button>
        <button style={styles.compareBtn} onClick={handleCompare} disabled={candidateIds.length < 2} id="compare-btn">
          ⚖️ Compare ({candidateIds.length})
        </button>
      </div>

      {candidateIds.length > 0 && (
        <div style={styles.tags}>
          {candidateIds.map(id => (
            <span key={id} style={styles.tag}>
              {id.substring(0, 12)}…
              <span style={styles.tagX} onClick={() => removeCandidate(id)}>✕</span>
            </span>
          ))}
        </div>
      )}

      {loading && <div style={styles.loading}>⏳ Comparing candidates...</div>}
      {error && <div style={styles.error}>❌ {error}</div>}

      {result && (
        <>
          {commonSkills.length > 0 && (
            <div style={styles.commonSection}>
              <div style={styles.commonTitle}>🤝 Common Skills ({commonSkills.length})</div>
              <div style={styles.skillsRow}>
                {commonSkills.map(s => (
                  <span key={s} style={styles.skillBadge(true)}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ ...styles.compGrid, gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}>
            {result.candidates?.map(c => (
              <div key={c.id} style={styles.card} id={`comparison-card-${c.id}`}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardName}>
                    {c.profile.firstName || c.profile.lastName
                      ? `${c.profile.firstName} ${c.profile.lastName}`.trim()
                      : c.email}
                  </h3>
                  <span style={styles.cardEmail}>{c.email}</span>
                  {c.profile.headline && (
                    <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>{c.profile.headline}</p>
                  )}
                </div>

                <div style={styles.statRow}>
                  <div style={styles.stat}>
                    <span style={styles.statNum('#a78bfa')}>{c.averageScore}%</span>
                    <span style={styles.statLabel}>Avg Score</span>
                  </div>
                  <div style={styles.stat}>
                    <span style={styles.statNum('#34d399')}>{c.passedAssessments}</span>
                    <span style={styles.statLabel}>Passed</span>
                  </div>
                  <div style={styles.stat}>
                    <span style={styles.statNum('#fbbf24')}>{c.totalEndorsements}</span>
                    <span style={styles.statLabel}>Endorsements</span>
                  </div>
                  <div style={styles.stat}>
                    <span style={styles.statNum('#6366f1')}>{c.profile.yearsOfExperience}</span>
                    <span style={styles.statLabel}>Years Exp</span>
                  </div>
                </div>

                <div style={styles.sectionLabel}>Skills</div>
                <div style={styles.skillsRow}>
                  {(c.profile.skills || []).slice(0, 12).map(s => (
                    <span key={s} style={styles.skillBadge(commonSkills.includes(s.toLowerCase()))}>
                      {s}
                    </span>
                  ))}
                </div>

                {c.assessments?.length > 0 && (
                  <>
                    <div style={styles.sectionLabel}>Assessments</div>
                    <div style={styles.assessmentRow}>
                      {c.assessments.slice(0, 5).map((a, i) => (
                        <span key={i} style={styles.assessmentBadge(a.passed)}>
                          {a.skill} — {a.score}%
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {c.endorsedSkills?.length > 0 && (
                  <>
                    <div style={styles.sectionLabel}>Top Endorsed</div>
                    <div style={styles.skillsRow}>
                      {c.endorsedSkills.slice(0, 5).map(e => (
                        <span key={e.skill} style={styles.endorsementSkill}>
                          {e.skill} ×{e.endorsementCount}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!result && !loading && !error && (
        <div style={styles.empty}>Add 2-4 candidate IDs and click Compare to start</div>
      )}
    </div>
  );
}
