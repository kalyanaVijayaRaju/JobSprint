import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

/**
 * Circular progress ring and interactive profile completion checklist widget.
 */
export default function ProfileCompleteness({ completeness }) {
  const navigate = useNavigate();

  if (!completeness) return null;

  const { percentage = 0, sections = {} } = completeness;

  const checklist = [
    { key: 'name', label: 'Basic Info & Name', link: '/profile' },
    { key: 'resume', label: 'Resume Upload', link: '/profile' },
    { key: 'skills', label: 'Technical Skills', link: '/profile' },
    { key: 'experience', label: 'Work Experience', link: '/profile' },
    { key: 'education', label: 'Education History', link: '/profile' },
    { key: 'portfolio', label: 'Portfolio / Social Links', link: '/profile' },
  ];

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        marginBottom: '28px',
        animation: 'scaleUp 0.4s ease both',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Conic-gradient Circular Progress */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `conic-gradient(var(--color-primary) ${percentage}%, var(--color-border) 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '78px',
              height: '78px',
              borderRadius: '50%',
              background: 'var(--color-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-main)', lineHeight: 1 }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Complete
            </span>
          </div>
        </div>

        {/* Info & Checklist */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
              Profile Strength
            </h4>
            {percentage < 100 && (
              <button
                type="button"
                onClick={() => navigate('/profile')}
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
                Complete Profile <ArrowRight size={12} />
              </button>
            )}
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {percentage === 100
              ? 'Your profile is 100% complete! Employers are 3x more likely to view your applications.'
              : 'Complete your candidate profile to get personalized job recommendations and higher recruiter response rates.'}
          </p>

          {/* Checklist Items */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '8px',
            }}
          >
            {checklist.map((item) => {
              const isDone = !!sections[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => !isDone && navigate(item.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: isDone ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    fontWeight: isDone ? '600' : '400',
                    cursor: isDone ? 'default' : 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  ) : (
                    <Circle size={16} style={{ color: 'var(--color-border)', flexShrink: 0 }} />
                  )}
                  <span style={{ textDecoration: isDone ? 'none' : 'underline' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
