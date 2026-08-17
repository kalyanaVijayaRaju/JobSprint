import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsApi, exportApi } from '../api/client.js';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, Calendar, Download } from 'lucide-react';
import { Button, Badge, Spinner } from '../components/ui';
import ExportButton from '../components/common/ExportButton.jsx';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.overview().catch(() => ({ data: null })),
      analyticsApi.pipelineFunnel().catch(() => ({ data: null }))
    ])
      .then(([oRes, fRes]) => {
        if (oRes.success) setOverview(oRes.data);
        if (fRes.success) setFunnel(fRes.data);
      })
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Spinner size="lg" label="Loading analytics dashboard..." /></div>;
  }

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <div className="analytics-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
            {isRecruiter ? 'Recruitment Analytics & Insights' : 'Job Search Performance & Insights'}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '14px' }}>
            {isRecruiter ? 'Track applicant conversion rates, time-to-hire, and posting efficiency.' : 'Track application progress, response rates, and interview conversion.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ExportButton type="analytics" />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {isRecruiter ? 'Total Applications Received' : 'Total Applied Jobs'}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-primary)', marginTop: '4px' }}>
            {overview?.totalApplications ?? 0}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Interviews Scheduled</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
            {overview?.interviewsCount ?? 0}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Offers / Hired</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            {overview?.offersCount ?? 0}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Conversion Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ec4899', marginTop: '4px' }}>
            {overview?.conversionRate ? `${Math.round(overview.conversionRate)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Funnel & Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Pipeline Funnel */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700 }}>Application Pipeline Breakdown</h3>

          {funnel?.stages ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(funnel.stages).map(([stage, count]) => {
                const percentage = overview?.totalApplications ? Math.round((count / overview.totalApplications) * 100) : 0;
                return (
                  <div key={stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{stage}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No pipeline data available yet</div>
          )}
        </div>

        {/* Skill Demand / Activity Summary */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>Platform Benchmarks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div style={{ padding: '14px', background: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700 }}>⚡ Response Speed</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Average time to first recruiter response is 2.4 days</div>
            </div>
            <div style={{ padding: '14px', background: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700 }}>🏆 Verified Badges Impact</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Candidates with verified skill badges get 3.2x more profile views</div>
            </div>
            <div style={{ padding: '14px', background: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700 }}>📈 High Demand Skills</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>React, Node.js, Python, SQL, AWS, TypeScript</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
