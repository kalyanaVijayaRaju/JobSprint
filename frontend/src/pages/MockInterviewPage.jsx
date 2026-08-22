import { useState, useEffect, useCallback } from 'react';
import { mockInterviewsApi } from '../api/client.js';

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: '28px',
    border: '1px solid rgba(148,163,184,0.1)', maxWidth: 800, margin: '0 auto 24px',
  },
  roleSelectRow: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  select: {
    padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: 14, outline: 'none', minWidth: 200,
  },
  btn: {
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  questionBox: {
    background: 'rgba(15,23,42,0.6)', borderRadius: 12, padding: '20px',
    borderLeft: '4px solid #6366f1', marginBottom: 20,
  },
  questionText: { fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 8px' },
  categoryBadge: { fontSize: 11, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase' },
  textarea: {
    width: '100%', minHeight: 120, padding: '14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16,
  },
  feedbackBox: {
    background: 'rgba(16,185,129,0.08)', borderRadius: 12, padding: '16px',
    border: '1px solid rgba(16,185,129,0.2)', marginTop: 16,
  },
  reportCard: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
    borderRadius: 16, padding: '28px', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center',
  },
  reportScore: { fontSize: 48, fontWeight: 800, color: '#34d399', margin: '8px 0' },
  historyItem: {
    background: 'rgba(30,41,59,0.5)', borderRadius: 10, padding: '14px 18px',
    border: '1px solid rgba(148,163,184,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
};

export default function MockInterviewPage() {
  const [role, setRole] = useState('Software Engineer');
  const [session, setSession] = useState(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await mockInterviewsApi.history();
      setHistory(res.data?.interviews || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await mockInterviewsApi.start({ jobRole: role });
      setSession(res.data?.interview || null);
      setActiveQuestionIdx(0);
      setUserAnswer('');
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!session || !userAnswer.trim()) return;
    setEvaluating(true);
    try {
      const res = await mockInterviewsApi.answer(session._id, {
        questionIndex: activeQuestionIdx,
        answerText: userAnswer,
      });
      setSession(res.data?.interview || session);
    } catch { /* ignore */ } finally { setEvaluating(false); }
  };

  const handleFinish = async () => {
    if (!session) return;
    try {
      const res = await mockInterviewsApi.finish(session._id);
      setSession(res.data?.interview || session);
      fetchHistory();
    } catch { /* ignore */ }
  };

  const currentQ = session?.questions?.[activeQuestionIdx];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎙️ Interactive Mock Interview Simulator</h1>
      <p style={styles.subtitle}>Practice technical and behavioral interview questions with real-time feedback scoring.</p>

      {!session && (
        <div style={styles.card}>
          <h2 style={{ fontSize: 18, color: '#f1f5f9', margin: '0 0 16px' }}>Select Target Role to Begin</h2>
          <div style={styles.roleSelectRow}>
            <select style={styles.select} value={role} onChange={e => setRole(e.target.value)} id="mock-role-select">
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Product Manager">Product Manager</option>
            </select>
            <button style={styles.btn} onClick={handleStart} disabled={loading} id="start-mock-btn">
              {loading ? 'Starting...' : '🚀 Start Practice Session'}
            </button>
          </div>
        </div>
      )}

      {session && session.status === 'in-progress' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Question {activeQuestionIdx + 1} of {session.questions.length}</span>
            <span style={styles.categoryBadge}>{currentQ?.category}</span>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.questionText}>{currentQ?.questionText}</p>
          </div>

          <form onSubmit={handleAnswerSubmit}>
            <textarea
              style={styles.textarea}
              placeholder="Type your structured answer here (explain trade-offs, architecture, STAR method)..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              id="mock-answer-input"
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" style={styles.btn} disabled={evaluating} id="submit-answer-btn">
                {evaluating ? 'Evaluating...' : '⚡ Submit Answer for Feedback'}
              </button>
              {activeQuestionIdx < session.questions.length - 1 && (
                <button
                  type="button"
                  style={{ ...styles.btn, background: 'rgba(148,163,184,0.15)', color: '#e2e8f0' }}
                  onClick={() => {
                    setActiveQuestionIdx(prev => prev + 1);
                    setUserAnswer(session.questions[activeQuestionIdx + 1]?.userAnswer || '');
                  }}
                  id="next-question-btn"
                >
                  Next Question →
                </button>
              )}
              <button type="button" style={{ ...styles.btn, background: '#10b981', marginLeft: 'auto' }} onClick={handleFinish} id="finish-mock-btn">
                🏁 Complete Session
              </button>
            </div>
          </form>

          {currentQ?.feedback && (
            <div style={styles.feedbackBox}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                Score: {currentQ.score}/100
              </div>
              <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>{currentQ.feedback}</p>
            </div>
          )}
        </div>
      )}

      {session && session.status === 'completed' && (
        <div style={styles.card}>
          <div style={styles.reportCard}>
            <h2 style={{ fontSize: 22, color: '#f1f5f9', margin: 0 }}>🎉 Session Complete!</h2>
            <div style={styles.reportScore}>{session.overallScore}%</div>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Overall Technical & Behavioral Score</p>
            <button style={{ ...styles.btn, marginTop: 16 }} onClick={() => setSession(null)}>Practice Another Session</button>
          </div>
        </div>
      )}

      {history.length > 0 && !session && (
        <div style={styles.card}>
          <h3 style={{ fontSize: 16, color: '#f1f5f9', margin: '0 0 16px' }}>📜 Past Session History</h3>
          {history.map(item => (
            <div key={item._id} style={styles.historyItem}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{item.jobRole}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: item.overallScore >= 75 ? '#34d399' : '#f59e0b' }}>
                Score: {item.overallScore}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
