import { useState, useEffect, useRef } from 'react';
import { Users, Briefcase, FileText, TrendingUp, Building2, Award } from 'lucide-react';

/**
 * Animated counter that counts up from 0 to the target value on mount.
 */
function AnimatedCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0;
    if (target === 0) { setDisplay(0); return; }

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

/**
 * Platform analytics stats cards and top skills/companies for the admin dashboard.
 */
export default function PlatformStats({ analytics, loading }) {
  if (loading || !analytics) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '24px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ height: '48px', background: 'var(--color-border)', borderRadius: '8px', opacity: 0.5 }} />
          </div>
        ))}
      </div>
    );
  }

  const { users, jobs, applications, topSkills, topCompanies, signupTrend } = analytics;

  const cards = [
    { label: 'Total Users', value: users.total, icon: <Users size={20} />, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Active Jobs', value: jobs.byStatus.active, icon: <Briefcase size={20} />, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Total Applications', value: applications.total, icon: <FileText size={20} />, color: '#10b981', bg: '#d1fae5' },
    { label: 'Offer Rate', value: `${applications.offerRate}%`, icon: <Award size={20} />, color: '#f59e0b', bg: '#fef3c7', isText: true },
    { label: 'Candidates', value: users.byRole.candidate, icon: <Users size={20} />, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Recruiters', value: users.byRole.recruiter, icon: <Building2 size={20} />, color: '#ec4899', bg: '#fce7f3' },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="card"
            style={{
              padding: '24px',
              animation: `scaleUp 0.4s ease ${i * 0.07}s both`,
              cursor: 'default',
              transition: 'var(--transition-smooth)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: card.bg,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-main)', lineHeight: 1 }}>
              {card.isText ? card.value : <AnimatedCounter value={card.value} />}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Signup Trend — CSS Bar Chart */}
      {signupTrend && signupTrend.length > 0 && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            <TrendingUp size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Monthly Sign-up Trend
          </h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
            {(() => {
              const maxCount = Math.max(...signupTrend.map((t) => t.count), 1);
              return signupTrend.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                    {item.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '48px',
                      height: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                      background: `linear-gradient(180deg, #6366f1, #8b5cf6)`,
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.6s ease',
                      animation: `slideUp 0.5s ease ${idx * 0.08}s both`,
                    }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Two-Column: Top Skills + Top Companies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Top In-Demand Skills */}
        {topSkills && topSkills.length > 0 && (
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
              Top In-Demand Skills
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const maxSkill = Math.max(...topSkills.map((s) => s.count), 1);
                return topSkills.map((skill, idx) => (
                  <div key={skill.skill} style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: `fadeIn 0.3s ease ${idx * 0.05}s both` }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)', minWidth: '120px' }}>
                      {skill.skill}
                    </span>
                    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--color-border)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(skill.count / maxSkill) * 100}%`,
                          background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                          borderRadius: '4px',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', minWidth: '32px', textAlign: 'right' }}>
                      {skill.count}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Top Hiring Companies */}
        {topCompanies && topCompanies.length > 0 && (
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
              Top Hiring Companies
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topCompanies.map((company, idx) => (
                <div
                  key={company._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--color-bg)',
                    animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                  }}
                >
                  {company.logo ? (
                    <img src={company.logo} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={14} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{company.industry}</div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {company.jobCount} jobs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
