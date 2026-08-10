import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, MapPin, Clock, Building2 } from 'lucide-react';
import { applicationsApi } from '../../api/client.js';
import { Badge, Spinner } from '../ui';

/**
 * Monthly calendar grid component for interview scheduling visualization.
 */
export default function InterviewCalendar({ role }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, [currentDate]);

  const loadInterviews = () => {
    setLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const apiCall = role === 'recruiter' ? applicationsApi.getRecruiterCalendar : applicationsApi.getCandidateCalendar;

    apiCall({ from: startOfMonth.toISOString(), to: endOfMonth.toISOString(), status: 'scheduled' })
      .then((res) => {
        if (res.success && res.data) {
          setInterviews(res.data.interviews || []);
        }
      })
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Build calendar days array for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map interviews by day of month
  const interviewsByDay = {};
  interviews.forEach((item) => {
    const d = new Date(item.scheduledAt).getDate();
    if (!interviewsByDay[d]) interviewsByDay[d] = [];
    interviewsByDay[d].push(item);
  });

  return (
    <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.4s ease' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)' }}>
            {monthName}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={prevMonth}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={prevMonth}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
            }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Spinner size="md" />
        </div>
      ) : (
        <div>
          {/* Day Names Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              fontWeight: '700',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              marginBottom: '8px',
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ padding: '8px' }}>{d}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {/* Empty offset cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '90px', background: 'var(--color-bg)', opacity: 0.3, borderRadius: '8px' }} />
            ))}

            {/* Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dayInterviews = interviewsByDay[day] || [];
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  style={{
                    minHeight: '90px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: isToday ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    border: `1px solid ${isToday ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: isToday ? '800' : '600', color: isToday ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                    {day}
                  </span>

                  {dayInterviews.map((item) => (
                    <div
                      key={item.interviewId}
                      onClick={() => setSelectedInterview(item)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        background: '#0ea5e9',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {item.job?.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
