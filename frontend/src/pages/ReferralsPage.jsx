import { useState, useEffect } from 'react';
import { referralsApi } from '../api/client.js';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [endorsementNote, setEndorsementNote] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await referralsApi.getReferrals();
      if (res.data) setReferrals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      const res = await referralsApi.requestReferral({
        companyName,
        targetRole,
        referrerName,
        endorsementNote
      });
      if (res.data) {
        setReferrals([res.data, ...referrals]);
        setShowModal(false);
        setCompanyName('');
        setTargetRole('');
        setReferrerName('');
        setEndorsementNote('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: 'rgba(234,179,8,0.15)', color: '#facc15', label: '⏳ Pending Review' },
      accepted: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: '🤝 Referrer Endorsed' },
      submitted: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', label: '🚀 Application Submitted' },
      hired: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: '🎉 Candidate Hired ($2,500 Bonus)' }
    };
    return map[status] || map.pending;
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' }}>
            🤝 Employee Referral & Endorsement Network
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
            Request internal employee endorsements and fast-track your applications with verified referral codes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          + Request Referral
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading referral network...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {referrals.map(ref => {
            const badge = getStatusBadge(ref.status);
            return (
              <div
                key={ref._id}
                style={{
                  background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: 24,
                  border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 16
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{ref.companyName}</h3>
                    <div style={{ fontSize: 13, color: '#38bdf8', marginTop: 4 }}>{ref.targetRole}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: 6 }}>
                    {badge.label}
                  </span>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.5)', padding: 14, borderRadius: 10, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>Endorser: {ref.referrerName}</div>
                  "{ref.endorsementNote}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(51,65,85,0.4)', padding: '10px 14px', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Referral Tracking Code</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', letterSpacing: '0.5px' }}>{ref.referralCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Bonus Pool</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{ref.referralBonus}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateReferral} style={{ background: '#1e293b', borderRadius: 20, padding: 28, maxWidth: 480, width: '90%', border: '1px solid rgba(148,163,184,0.15)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginTop: 0 }}>Request Referral</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe or Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Architect"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Referrer / Employee Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan (Staff Eng)"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Endorsement / Pitch Note</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Why would you be a top recommendation for this role?"
                  value={endorsementNote}
                  onChange={(e) => setEndorsementNote(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Submit Referral</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
