import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { activityFeedApi } from '../api/client.js';
import {
  Activity, Briefcase, Award, FileText, Star, User, Building2, CheckCircle2, RefreshCw, MessageSquare
} from 'lucide-react';
import { Button, Badge, Spinner, EmptyState } from '../components/ui';

const FEED_TYPES = [
  { id: '', label: 'All Activities' },
  { id: 'applied', label: 'Applications' },
  { id: 'badge-earned', label: 'Badges Earned' },
  { id: 'job-posted', label: 'New Job Posts' },
  { id: 'review-posted', label: 'Company Reviews' }
];

export default function ActivityFeedPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('');
  const [activeTab, setActiveTab] = useState('public'); // 'public' | 'mine'

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeType) params.type = activeType;

      const res = activeTab === 'public'
        ? await activityFeedApi.getPublic(params)
        : await activityFeedApi.getMine(params);

      if (res.success) {
        setActivities(res.data.activities || []);
      }
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeType]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'applied': return <Briefcase size={18} style={{ color: '#3b82f6' }} />;
      case 'badge-earned': return <Award size={18} style={{ color: '#f59e0b' }} />;
      case 'job-posted': return <Building2 size={18} style={{ color: '#10b981' }} />;
      case 'review-posted': return <Star size={18} style={{ color: '#ec4899' }} />;
      case 'resume-created': return <FileText size={18} style={{ color: '#6366f1' }} />;
      default: return <Activity size={18} style={{ color: 'var(--color-primary)' }} />;
    }
  };

  return (
    <div className="activity-feed-page" style={{ padding: '24px', maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Community Activity Feed</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '14px' }}>Real-time updates on applications, badges earned, and new job openings across JobSprint.</p>
        </div>

        <Button variant="outline" size="sm" onClick={loadFeed} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
        <button
          type="button"
          className={`assessments-tab ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          Public Activity Feed
        </button>
        <button
          type="button"
          className={`assessments-tab ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          My Timeline
        </button>
      </div>

      {/* Type Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {FEED_TYPES.map(ft => (
          <button
            key={ft.id}
            type="button"
            onClick={() => setActiveType(ft.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              background: activeType === ft.id ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeType === ft.id ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {ft.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading && activities.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}><Spinner size="lg" label="Loading activity feed..." /></div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activities yet"
          description="Be the first to apply for a job or take a skill assessment!"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activities.map((act) => (
            <div
              key={act._id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--color-border)'
              }}>
                {getActivityIcon(act.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {act.title}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(act.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {act.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 8px', lineHeight: 1.4 }}>
                    {act.description}
                  </p>
                )}

                {/* Metadata Pills */}
                {act.metadata && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {act.metadata.jobTitle && <Badge style={{ fontSize: '11px' }}>💼 {act.metadata.jobTitle}</Badge>}
                    {act.metadata.companyName && <Badge style={{ fontSize: '11px' }}>🏢 {act.metadata.companyName}</Badge>}
                    {act.metadata.badge && <Badge style={{ fontSize: '11px' }}>🏆 {act.metadata.badge}</Badge>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
