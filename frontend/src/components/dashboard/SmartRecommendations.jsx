import { useState, useEffect } from 'react';
import { recommendationsApi } from '../../api/client.js';
import { Sparkles, MapPin, Briefcase, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';
import { Badge, Button, Spinner } from '../ui';
import { useNavigate } from 'react-router-dom';

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    recommendationsApi.getJobs(4)
      .then((res) => {
        if (res.success) setRecommendations(res.data.jobs || []);
      })
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>AI Job Recommendations</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Personalized matches based on your skills & verified badges</span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
          View All <ChevronRight size={14} />
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {recommendations.map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/jobs/${job._id}`)}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s, border-color 0.15s'
            }}
            className="hover-lift"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>{job.title}</span>
                <Badge style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                  {job.matchPercentage || 85}% Match
                </Badge>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {job.companyId?.name || job.company} • {job.location || 'Remote'}
              </div>

              {/* Match Reasons */}
              {job.matchReasons && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {job.matchReasons.map((reason, idx) => (
                    <span key={idx} style={{ fontSize: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{job.jobType || 'Full-time'}</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Apply Now →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
