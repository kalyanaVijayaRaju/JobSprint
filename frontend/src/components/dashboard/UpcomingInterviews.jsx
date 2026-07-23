import { Calendar, Clock, Video, ChevronRight, MapPin } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard widget listing upcoming interviews scheduled for candidates or recruiters.
 */
export default function UpcomingInterviews({ upcomingInterviews = [] }) {
  const navigate = useNavigate();

  if (!upcomingInterviews || upcomingInterviews.length === 0) {
    return (
      <Card variant="elevated" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: 'var(--color-primary)' }} /> Upcoming Interviews
          </h3>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
          No upcoming interviews scheduled. Scheduled interview invitations will appear here.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--color-primary)' }} /> Upcoming Interviews ({upcomingInterviews.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/applications')}
          icon={<ChevronRight size={16} />}
        >
          View All
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {upcomingInterviews.slice(0, 5).map((interview) => {
          const dateObj = new Date(interview.scheduledAt);
          return (
            <div
              key={interview._id || interview.scheduledAt}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'var(--color-bg)',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Video size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '14px', display: 'block' }}>
                    {interview.jobTitle || 'Interview Session'}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {interview.companyName || interview.candidateName || 'Scheduled Interview'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)' }}>
                  <Calendar size={13} /> {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)' }}>
                  <Clock size={13} /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Badge variant={`status-${interview.candidateResponseStatus || 'pending'}`}>
                  {interview.candidateResponseStatus || 'scheduled'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
