import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { Badge, Button } from '../ui';

/**
 * Skill-matched job recommendations widget for candidate dashboard.
 */
export default function RecommendedJobs({ recommendations = [] }) {
  const navigate = useNavigate();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        marginBottom: '28px',
        animation: 'scaleUp 0.4s ease 0.1s both',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            Recommended For You
          </h4>
        </div>
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View All Jobs <ArrowRight size={12} />
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {recommendations.slice(0, 4).map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/jobs?selected=${job._id}`)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header: Company & Match Score Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={14} />
                    </div>
                  )}
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                    {job.company?.name || 'Tech Corp'}
                  </span>
                </div>
                {job.matchScore > 0 && (
                  <Badge
                    style={{
                      background: job.matchScore >= 75 ? '#d1fae5' : '#fef3c7',
                      color: job.matchScore >= 75 ? '#065f46' : '#92400e',
                      fontWeight: '700',
                      fontSize: '11px',
                    }}
                  >
                    {job.matchScore}% Match
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h5 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                {job.title}
              </h5>

              {/* Job Details */}
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {job.location}
                </span>
                <span style={{ textTransform: 'capitalize' }}>{job.locationType}</span>
              </div>
            </div>

            {/* Matched Skills */}
            {job.matchedSkills && job.matchedSkills.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {job.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontWeight: '600',
                    }}
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
