import { useState, useEffect } from 'react';
import { videoPitchesApi } from '../api/client.js';

export default function VideoPitchesPage() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    try {
      setLoading(true);
      const res = await videoPitchesApi.getPitches();
      if (res.data) setPitches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePitch = async (e) => {
    e.preventDefault();
    try {
      const res = await videoPitchesApi.createPitch({
        title,
        targetJobTitle: targetJob,
        transcript,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      });
      if (res.data) {
        setPitches([res.data, ...pitches]);
        setShowModal(false);
        setTitle('');
        setTargetJob('');
        setTranscript('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    try {
      await videoPitchesApi.likePitch(id);
      setPitches(pitches.map(p => p._id === id ? { ...p, likesCount: p.likesCount + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' }}>
            📹 Candidate Video Elevator Pitches
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
            Record, preview, and showcase 60-second video introductions to recruiters.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          + Record Elevator Pitch
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading video pitches...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {pitches.map(pitch => (
            <div
              key={pitch._id}
              style={{
                background: 'rgba(30,41,59,0.7)', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', width: '100%', background: '#000', aspectRatio: '16/9' }}>
                <video
                  src={pitch.videoUrl}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                  ⏱ {pitch.durationSeconds || 60}s
                </span>
              </div>

              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{pitch.title}</h3>
                  <div style={{ fontSize: 12, color: '#a78bfa', marginTop: 4 }}>
                    🎯 Target: {pitch.targetJobTitle}
                  </div>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.5)', padding: 12, borderRadius: 8, fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, flex: 1 }}>
                  💬 "{pitch.transcript}"
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {pitch.tags?.map((t, idx) => (
                    <span key={idx} style={{ fontSize: 10, background: 'rgba(236,72,153,0.15)', color: '#f472b6', padding: '2px 6px', borderRadius: 4 }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>👁 {pitch.viewsCount} Recruiter Views</span>
                  <button
                    onClick={() => handleLike(pitch._id)}
                    style={{ background: 'transparent', border: 'none', color: '#ec4899', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                  >
                    ❤️ {pitch.likesCount} Endorsements
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreatePitch} style={{ background: '#1e293b', borderRadius: 20, padding: 28, maxWidth: 480, width: '90%', border: '1px solid rgba(148,163,184,0.15)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginTop: 0 }}>Publish Video Pitch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Pitch Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60-sec Backend & Distributed Systems Intro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Role / Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full-Stack Engineer @ Stripe"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Transcript / Key Highlights</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter a brief transcript of your pitch..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Publish Pitch</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
