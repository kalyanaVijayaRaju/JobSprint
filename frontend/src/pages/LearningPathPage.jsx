import { useState, useEffect } from 'react';
import { learningPathsApi } from '../api/client.js';

export default function LearningPathPage() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState('');
  const [newGap, setNewGap] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const res = await learningPathsApi.getPaths();
      if (res.data) setPaths(res.data);
    } catch (err) {
      console.error('Failed to fetch learning paths', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async (e) => {
    e.preventDefault();
    try {
      const res = await learningPathsApi.createPath({ targetRole: newRole, skillGap: newGap });
      if (res.data) {
        setPaths([res.data, ...paths]);
        setShowModal(false);
        setNewRole('');
        setNewGap('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleModule = async (pathId, moduleId) => {
    try {
      await learningPathsApi.toggleModule(pathId, moduleId);
      setPaths(paths.map(p => {
        if (p._id === pathId) {
          const updatedModules = p.modules.map(m => m._id === moduleId ? { ...m, isCompleted: !m.isCompleted } : m);
          const completedCount = updatedModules.filter(m => m.isCompleted).length;
          const progress = Math.round((completedCount / updatedModules.length) * 100);
          return { ...p, modules: updatedModules, progress };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' }}>
            🎓 Skill Gap Learning Pathfinder
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
            Tailored learning paths to bridge candidate skill gaps and unlock dream technical roles.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          + Create Learning Path
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading learning roadmaps...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
          {paths.map(path => (
            <div
              key={path._id}
              style={{
                background: 'rgba(30,41,59,0.7)', borderRadius: 16, padding: 24,
                border: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{path.targetRole}</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', padding: '3px 8px', borderRadius: 6 }}>
                    {path.level || 'Intermediate'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
                  🎯 Targeted Gap: <strong style={{ color: '#38bdf8' }}>{path.skillGap}</strong>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1', marginBottom: 6 }}>
                  <span>Roadmap Progress</span>
                  <span>{path.progress}% Completed</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'rgba(51,65,85,0.6)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${path.progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Modules & Milestones:</h4>
                {path.modules?.map(mod => (
                  <div
                    key={mod._id}
                    onClick={() => handleToggleModule(path._id, mod._id)}
                    style={{
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      background: mod.isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.4)',
                      border: `1px solid ${mod.isCompleted ? 'rgba(16,185,129,0.3)' : 'rgba(148,163,184,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{mod.isCompleted ? '✅' : '⏳'}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: mod.isCompleted ? '#6ee7b7' : '#f1f5f9', textDecoration: mod.isCompleted ? 'line-through' : 'none' }}>
                          {mod.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {mod.durationMinutes} min • {mod.resourceType}
                        </div>
                      </div>
                    </div>
                    {mod.resourceUrl && (
                      <a
                        href={mod.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none' }}
                      >
                        Launch ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreatePath} style={{ background: '#1e293b', borderRadius: 20, padding: 28, maxWidth: 460, width: '90%', border: '1px solid rgba(148,163,184,0.15)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginTop: 0 }}>Create New Skill Path</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Job Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Lead"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Primary Skill Gap to Master</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL & WebSockets"
                  value={newGap}
                  onChange={(e) => setNewGap(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Generate Path</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
