import { useState, useEffect, useCallback } from 'react';
import { mentorshipApi } from '../api/client.js';

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '20px',
    border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 12,
  },
  mentorName: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  mentorTitle: { fontSize: 13, color: '#a78bfa', margin: '2px 0 0' },
  mentorCompany: { fontSize: 13, color: '#94a3b8', margin: '2px 0 8px' },
  bio: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, flex: 1 },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0' },
  badge: {
    fontSize: 11, fontWeight: 600, color: '#60a5fa', background: 'rgba(59,130,246,0.15)',
    borderRadius: 6, padding: '3px 8px',
  },
  btn: {
    padding: '10px 16px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center', marginTop: 4,
  },
  tabRow: { display: 'flex', gap: 12, marginBottom: 24 },
  tabBtn: (active) => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(30,41,59,0.6)',
    color: active ? '#fff' : '#94a3b8',
  }),
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#1e293b', borderRadius: 20, padding: '28px', maxWidth: 450, width: '90%',
    border: '1px solid rgba(148,163,184,0.15)',
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginTop: 4,
  },
};

export default function MentorshipPage() {
  const [activeTab, setActiveTab] = useState('browse');
  const [mentors, setMentors] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingForm, setBookingForm] = useState({ topic: 'career-strategy', scheduledAt: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      let res = await mentorshipApi.getMentors();
      if (!res.data?.mentors || res.data.mentors.length === 0) {
        await mentorshipApi.seedMentors();
        res = await mentorshipApi.getMentors();
      }
      setMentors(res.data?.mentors || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchMySessions = useCallback(async () => {
    try {
      const res = await mentorshipApi.mySessions();
      setMySessions(res.data?.sessions || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchMentors();
    fetchMySessions();
  }, [fetchMentors, fetchMySessions]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMentor || !bookingForm.scheduledAt) return;
    try {
      await mentorshipApi.bookSession({
        mentorUserId: selectedMentor.userId._id || selectedMentor.userId,
        ...bookingForm,
      });
      setSelectedMentor(null);
      fetchMySessions();
      setActiveTab('my-sessions');
    } catch { /* ignore */ }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎓 Peer Mentorship & Booking Hub</h1>
      <p style={styles.subtitle}>Connect 1-on-1 with industry leaders and recruiters for career guidance, resume reviews, and mock interviews.</p>

      <div style={styles.tabRow}>
        <button style={styles.tabBtn(activeTab === 'browse')} onClick={() => setActiveTab('browse')} id="tab-browse-mentors">
          🔍 Browse Mentors ({mentors.length})
        </button>
        <button style={styles.tabBtn(activeTab === 'my-sessions')} onClick={() => setActiveTab('my-sessions')} id="tab-my-sessions">
          📅 My Booked Sessions ({mySessions.length})
        </button>
      </div>

      {activeTab === 'browse' && (
        <div style={styles.grid}>
          {mentors.map(m => (
            <div key={m._id} style={styles.card}>
              <div>
                <h3 style={styles.mentorName}>{m.name}</h3>
                <p style={styles.mentorTitle}>{m.title}</p>
                <p style={styles.mentorCompany}>🏢 {m.company} • ⭐ {m.rating} ({m.reviewCount} reviews)</p>
              </div>
              <p style={styles.bio}>{m.bio}</p>
              <div style={styles.tagGrid}>
                {(m.skills || []).map(s => <span key={s} style={styles.badge}>{s}</span>)}
              </div>
              <button style={styles.btn} onClick={() => setSelectedMentor(m)} id={`book-mentor-${m._id}`}>
                📅 Book 1-on-1 Session (₹{m.hourlyRate}/hr)
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'my-sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mySessions.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No mentorship sessions booked yet.</div>
          ) : (
            mySessions.map(s => (
              <div key={s._id} style={{ ...styles.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, color: '#f1f5f9', margin: 0 }}>Topic: {s.topic}</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
                    Scheduled: {new Date(s.scheduledAt).toLocaleString()} ({s.duration} min)
                  </p>
                </div>
                {s.meetingLink && (
                  <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ ...styles.btn, textDecoration: 'none' }}>
                    🔗 Join Video Session
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {selectedMentor && (
        <div style={styles.modal} onClick={() => setSelectedMentor(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, color: '#f1f5f9', margin: '0 0 16px' }}>Book Session with {selectedMentor.name}</h2>
            <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Session Topic</label>
                <select style={styles.input} value={bookingForm.topic} onChange={e => setBookingForm(f => ({ ...f, topic: e.target.value }))} id="book-topic-select">
                  <option value="career-strategy">Career Strategy</option>
                  <option value="resume-review">Resume Review</option>
                  <option value="mock-interview">Mock Interview</option>
                  <option value="system-design">System Design</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Date & Time</label>
                <input style={styles.input} type="datetime-local" value={bookingForm.scheduledAt} onChange={e => setBookingForm(f => ({ ...f, scheduledAt: e.target.value }))} required id="book-time-input" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Notes for Mentor (optional)</label>
                <textarea style={{ ...styles.input, minHeight: 60 }} value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} id="book-notes-input" />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" style={{ ...styles.btn, background: 'transparent', border: '1px solid rgba(148,163,184,0.2)' }} onClick={() => setSelectedMentor(null)}>Cancel</button>
                <button type="submit" style={styles.btn} id="confirm-book-btn">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
