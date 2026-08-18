import { useState, useEffect, useCallback } from 'react';
import { endorsementsApi } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

const RELATIONSHIP_LABELS = {
  colleague: '👥 Colleague', manager: '👔 Manager', recruiter: '🔍 Recruiter',
  mentor: '🎓 Mentor', client: '🤝 Client', other: '📎 Other',
};

const styles = {
  section: { marginBottom: 32 },
  title: { fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 },
  skillGrid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  skillBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 12, padding: '8px 16px', cursor: 'default',
    transition: 'background 0.2s, transform 0.15s',
  },
  skillName: { fontSize: 14, fontWeight: 600, color: '#a78bfa' },
  skillCount: {
    fontSize: 12, fontWeight: 700, color: '#6366f1',
    background: 'rgba(99,102,241,0.2)', borderRadius: 8,
    padding: '2px 8px', minWidth: 24, textAlign: 'center',
  },
  endorserList: {
    display: 'flex', gap: 4, marginLeft: 4,
  },
  endorserAvatar: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, color: '#fff',
    border: '2px solid rgba(15,23,42,0.8)',
  },
  endorseForm: {
    background: 'rgba(30,41,59,0.6)', borderRadius: 14, padding: '16px 20px',
    border: '1px solid rgba(148,163,184,0.1)', marginTop: 16,
  },
  formRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' },
  input: {
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 13, outline: 'none', flex: '1 1 120px',
  },
  select: {
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 13, outline: 'none',
  },
  endorseBtn: {
    padding: '8px 20px', borderRadius: 8, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  allEndorsements: {
    marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
  },
  endorsementCard: {
    background: 'rgba(30,41,59,0.5)', borderRadius: 12, padding: '12px 16px',
    border: '1px solid rgba(148,163,184,0.08)',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  endorsementSkill: { fontSize: 14, fontWeight: 600, color: '#a78bfa' },
  endorsementMeta: { fontSize: 12, color: '#94a3b8' },
  endorsementMsg: { fontSize: 13, color: '#cbd5e1', fontStyle: 'italic', marginTop: 4 },
  empty: { fontSize: 13, color: '#64748b', padding: '16px 0' },
  msg: (ok) => ({ fontSize: 13, color: ok ? '#34d399' : '#f87171', marginTop: 8 }),
};

export default function EndorsementsSection({ userId, isOwnProfile = false }) {
  const { user } = useAuth();
  const [topSkills, setTopSkills] = useState([]);
  const [allEndorsements, setAllEndorsements] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ skill: '', message: '', relationship: 'colleague' });
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [skillsRes, allRes] = await Promise.all([
        endorsementsApi.getTopSkills(userId),
        endorsementsApi.getForUser(userId),
      ]);
      setTopSkills(skillsRes.data?.skills || []);
      setAllEndorsements(allRes.data?.endorsements || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEndorse = async (e) => {
    e.preventDefault();
    if (!form.skill.trim()) return;
    setMsg('');
    try {
      await endorsementsApi.endorse({
        endorseeId: userId,
        skill: form.skill.trim(),
        message: form.message,
        relationship: form.relationship,
      });
      setMsg('✅ Endorsement added!');
      setForm({ skill: '', message: '', relationship: 'colleague' });
      fetchData();
    } catch (err) {
      setMsg(`❌ ${err.message || 'Failed to endorse'}`);
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading endorsements...</div>;

  const getInitials = (email) => (email ? email.substring(0, 2).toUpperCase() : '??');

  return (
    <div style={styles.section} id="endorsements-section">
      <h3 style={styles.title}>🏆 Skill Endorsements</h3>

      {topSkills.length > 0 ? (
        <div style={styles.skillGrid}>
          {topSkills.map(s => (
            <div key={s.skill} style={styles.skillBadge}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={styles.skillName}>{s.skill}</span>
              <span style={styles.skillCount}>{s.count}</span>
              <div style={styles.endorserList}>
                {s.endorsers.slice(0, 3).map((e, i) => (
                  <div key={i} style={styles.endorserAvatar} title={e.email}>
                    {getInitials(e.email)}
                  </div>
                ))}
                {s.count > 3 && (
                  <div style={{ ...styles.endorserAvatar, background: 'rgba(100,116,139,0.4)', fontSize: 9 }}>
                    +{s.count - 3}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>No endorsements yet</div>
      )}

      {!isOwnProfile && user && user.id !== userId && (
        <div style={styles.endorseForm}>
          <form onSubmit={handleEndorse}>
            <div style={styles.formRow}>
              <input style={styles.input} placeholder="Skill (e.g. React, Node.js)"
                value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}
                required id="endorse-skill-input" />
              <select style={styles.select} value={form.relationship}
                onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} id="endorse-relationship">
                {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button type="submit" style={styles.endorseBtn} id="endorse-submit-btn">
                👍 Endorse
              </button>
            </div>
            <input style={{ ...styles.input, marginTop: 8, width: '100%', boxSizing: 'border-box' }}
              placeholder="Add a message (optional)"
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              id="endorse-message-input" />
            {msg && <p style={styles.msg(msg.startsWith('✅'))}>{msg}</p>}
          </form>
        </div>
      )}

      {allEndorsements.length > 0 && (
        <>
          <button
            style={{ ...styles.endorseBtn, marginTop: 16, background: 'rgba(99,102,241,0.15)', color: '#a78bfa' }}
            onClick={() => setShowAll(!showAll)}
            id="toggle-all-endorsements"
          >
            {showAll ? 'Hide' : `Show All (${allEndorsements.length})`}
          </button>
          {showAll && (
            <div style={styles.allEndorsements}>
              {allEndorsements.map(e => (
                <div key={e._id} style={styles.endorsementCard}>
                  <div style={styles.endorserAvatar}>{getInitials(e.endorserId?.email)}</div>
                  <div>
                    <span style={styles.endorsementSkill}>{e.skill}</span>
                    <span style={styles.endorsementMeta}>
                      {' '} — {RELATIONSHIP_LABELS[e.relationship] || e.relationship}
                      {' · '}{new Date(e.createdAt).toLocaleDateString()}
                    </span>
                    {e.message && <p style={styles.endorsementMsg}>"{e.message}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
