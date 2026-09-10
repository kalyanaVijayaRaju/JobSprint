import { useState, useEffect } from 'react';
import { cultureMatchApi } from '../api/client.js';

const CULTURE_QUESTIONS = [
  { id: 'q1', text: 'Communication Style Preference', options: ['Async documentation first', 'Real-time Huddles & Syncs', 'Hybrid Slack/Meetings'] },
  { id: 'q2', text: 'Engineering Pacing & Shipping Velocity', options: ['Daily Production Deploys', 'Bi-weekly Sprints', 'Quarterly Milestones'] },
  { id: 'q3', text: 'Team Hierarchy & Ownership', options: ['Flat & Autonomous Pods', 'Structured Tech Lead Mentorship', 'Matrix Enterprise Ownership'] },
  { id: 'q4', text: 'Workplace Location Model', options: ['100% Remote / Distributed', 'Hybrid (2-3 days office)', 'In-Office HQ Collaboration'] }
];

export default function CultureMatchPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetCompany, setTargetCompany] = useState('');
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await cultureMatchApi.getProfiles();
      if (res.data) setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId, optionVal) => {
    setAnswers({ ...answers, [qId]: optionVal });
  };

  const handleEvaluateMatch = async (e) => {
    e.preventDefault();
    try {
      setEvaluating(true);
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({ questionId: qId, answerValue: val }));
      const res = await cultureMatchApi.evaluateMatch({ companyName: targetCompany, answers: formattedAnswers });
      if (res.data) {
        setProfiles([res.data, ...profiles]);
        setTargetCompany('');
        setAnswers({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' }}>
          🏛️ Company Culture & Value Alignment Evaluator
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          Evaluate work style compatibility and team value alignment before accepting job offers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Left Column: Assessment Form */}
        <div style={{ background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: 24, border: '1px solid rgba(148,163,184,0.1)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 0 }}>Evaluate Target Company Culture</h3>
          <form onSubmit={handleEvaluateMatch} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Airbnb, Linear"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {CULTURE_QUESTIONS.map(q => (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{q.text}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {q.options.map(opt => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, opt)}
                        style={{
                          padding: '10px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'center',
                          background: selected ? 'rgba(168,85,247,0.2)' : 'rgba(15,23,42,0.5)',
                          color: selected ? '#c084fc' : '#94a3b8',
                          border: `1px solid ${selected ? '#c084fc' : 'rgba(148,163,184,0.1)'}`
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={evaluating || !targetCompany}
              style={{
                padding: '12px 24px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: evaluating || !targetCompany ? 'not-allowed' : 'pointer', marginTop: 10
              }}
            >
              {evaluating ? 'Calculating Match Score...' : '✨ Calculate Culture Match Score'}
            </button>
          </form>
        </div>

        {/* Right Column: Calculated Matches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Company Culture Scorecards</h3>
          {loading ? (
            <div style={{ color: '#94a3b8' }}>Loading culture profiles...</div>
          ) : (
            profiles.map(prof => (
              <div
                key={prof._id}
                style={{
                  background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: 20,
                  border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{prof.companyName}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
                    🔥 {prof.overallMatchScore}% Match
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
                  <div>💬 <strong>Work Style:</strong> {prof.workStyle}</div>
                  <div>👥 <strong>Team Structure:</strong> {prof.teamStructure}</div>
                  <div>⚡ <strong>Pacing:</strong> {prof.pacing}</div>
                  <div>⚖️ <strong>Work-Life Balance:</strong> ⭐ {prof.workLifeBalanceRating} / 5.0</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
