import { CheckCircle2, Clock, FileText, Video, Phone, MapPin, XCircle, ArrowUpCircle, Send } from 'lucide-react';

const STATUS_CONFIG = {
  applied: { icon: Send, color: '#6366f1', label: 'Applied' },
  screening: { icon: FileText, color: '#f59e0b', label: 'Screening' },
  interviewing: { icon: Video, color: '#8b5cf6', label: 'Interviewing' },
  offered: { icon: ArrowUpCircle, color: '#10b981', label: 'Offered' },
  rejected: { icon: XCircle, color: '#ef4444', label: 'Rejected' },
  withdrawn: { icon: XCircle, color: '#6b7280', label: 'Withdrawn' },
};

/**
 * ApplicationTimeline — vertical animated timeline showing status history.
 */
export default function ApplicationTimeline({ statusTimeline = [], interviews = [] }) {
  if (!statusTimeline || statusTimeline.length === 0) {
    return (
      <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
        No status history available
      </div>
    );
  }

  // Merge status changes and interviews into one timeline
  const events = [];

  statusTimeline.forEach((entry) => {
    events.push({
      type: 'status',
      status: entry.status,
      date: new Date(entry.updatedAt),
      ...STATUS_CONFIG[entry.status]
    });
  });

  interviews.forEach((interview) => {
    const meetingIcons = { video: Video, phone: Phone, onsite: MapPin };
    events.push({
      type: 'interview',
      status: 'interview',
      label: `Interview (${interview.meetingType})`,
      icon: meetingIcons[interview.meetingType] || Video,
      color: '#8b5cf6',
      date: new Date(interview.scheduledAt),
      interviewStatus: interview.status,
      candidateResponse: interview.candidateResponse,
      duration: interview.durationMinutes
    });
  });

  // Sort chronologically
  events.sort((a, b) => a.date - b.date);

  return (
    <div className="app-timeline">
      {events.map((event, idx) => {
        const Icon = event.icon || Clock;
        const isLast = idx === events.length - 1;
        const duration = idx > 0 ? Math.round((event.date - events[idx - 1].date) / (1000 * 60 * 60 * 24)) : null;

        return (
          <div key={idx} className={`app-timeline-item ${isLast ? 'last' : ''}`}>
            {!isLast && <div className="app-timeline-connector" />}

            <div
              className="app-timeline-dot"
              style={{ background: event.color, animationDelay: `${idx * 0.15}s` }}
            >
              <Icon size={14} color="#fff" />
            </div>

            <div className="app-timeline-content" style={{ animationDelay: `${idx * 0.15}s` }}>
              <div className="app-timeline-label">{event.label}</div>
              <div className="app-timeline-date">
                {event.date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {event.type === 'interview' && (
                <div className="app-timeline-interview-detail">
                  <span>Duration: {event.duration} min</span>
                  {event.interviewStatus && (
                    <span className={`app-timeline-badge ${event.interviewStatus}`}>
                      {event.interviewStatus}
                    </span>
                  )}
                  {event.candidateResponse && event.candidateResponse !== 'pending' && (
                    <span className={`app-timeline-badge ${event.candidateResponse}`}>
                      {event.candidateResponse}
                    </span>
                  )}
                </div>
              )}
              {duration !== null && duration > 0 && (
                <div className="app-timeline-duration">
                  {duration} day{duration !== 1 ? 's' : ''} after previous step
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
