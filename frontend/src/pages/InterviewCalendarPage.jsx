import { useState, useEffect, useCallback, useMemo } from 'react';
import { interviewsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TYPE_ICONS = { video: '📹', phone: '📞', 'in-person': '🏢' };
const STATUS_COLORS = {
  scheduled: '#6366f1', rescheduled: '#f59e0b', completed: '#10b981', cancelled: '#ef4444', 'no-show': '#94a3b8'
};

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  navRow: { display: 'flex', alignItems: 'center', gap: 12 },
  navBtn: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(30,41,59,0.6)', color: '#e2e8f0', fontSize: 13, cursor: 'pointer',
    transition: 'background 0.15s',
  },
  monthLabel: { fontSize: 18, fontWeight: 700, color: '#e2e8f0', minWidth: 200, textAlign: 'center' },
  viewToggle: { display: 'flex', gap: 4, background: 'rgba(30,41,59,0.6)', borderRadius: 10, padding: 3 },
  toggleBtn: (active) => ({
    padding: '6px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
    color: active ? '#fff' : '#94a3b8', transition: 'all 0.2s',
  }),
  calGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
  },
  dayHeader: {
    textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b',
    padding: '8px 0', textTransform: 'uppercase',
  },
  dayCell: (isToday, hasEvents) => ({
    minHeight: 90, padding: '6px 8px', borderRadius: 10,
    background: isToday ? 'rgba(99,102,241,0.1)' : 'rgba(30,41,59,0.4)',
    border: isToday ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(148,163,184,0.06)',
    cursor: hasEvents ? 'pointer' : 'default',
    transition: 'background 0.15s',
  }),
  dayNum: (isToday) => ({
    fontSize: 13, fontWeight: isToday ? 800 : 500,
    color: isToday ? '#a78bfa' : '#94a3b8', marginBottom: 4,
  }),
  dayDot: (color) => ({
    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
    background: color, marginRight: 3, marginBottom: 2,
  }),
  dayLabel: { fontSize: 11, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', marginBottom: 2 },
  emptyDay: { minHeight: 90, padding: 6, borderRadius: 10, background: 'rgba(15,23,42,0.3)' },
  listView: { display: 'flex', flexDirection: 'column', gap: 12 },
  interviewCard: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 14, padding: '18px 22px',
    border: '1px solid rgba(148,163,184,0.1)', display: 'flex', gap: 16, alignItems: 'flex-start',
    transition: 'border-color 0.2s',
  },
  cardLeft: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: '12px 16px', minWidth: 70,
  },
  cardDay: { fontSize: 24, fontWeight: 800, color: '#a78bfa' },
  cardMonth: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' },
  cardTime: { fontSize: 12, color: '#6366f1', fontWeight: 600, marginTop: 4 },
  cardRight: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' },
  cardCompany: { fontSize: 13, color: '#94a3b8', margin: '0 0 8px' },
  metaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  badge: (bg, color) => ({
    fontSize: 11, fontWeight: 600, color, background: bg,
    borderRadius: 6, padding: '3px 10px',
  }),
  notes: { fontSize: 13, color: '#cbd5e1', fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 },
  link: { fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600 },
  scheduleBtn: {
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#1e293b', borderRadius: 20, padding: '32px', maxWidth: 500, width: '90%',
    border: '1px solid rgba(148,163,184,0.15)', maxHeight: '80vh', overflowY: 'auto',
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  input: {
    padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none',
  },
  select: {
    padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)',
    color: '#e2e8f0', fontSize: 14, outline: 'none',
  },
  modalActions: { display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)',
    background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer',
  },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8' },
  empty: { textAlign: 'center', padding: 60, color: '#64748b', fontSize: 15 },
  cancelInterviewBtn: {
    padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 11, cursor: 'pointer',
    fontWeight: 600, marginLeft: 'auto',
  },
};

export default function InterviewCalendarPage() {
  const { user } = useAuth();
  const [view, setView] = useState('calendar');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    candidateId: '', jobId: '', scheduledAt: '', duration: 60, type: 'video',
    meetingLink: '', location: '', notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [calRes, upRes] = await Promise.all([
        interviewsApi.calendar(month, year),
        interviewsApi.list(),
      ]);
      setCalendarData(calRes.data?.calendar || {});
      setUpcoming(upRes.data?.interviews || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navigateMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isToday: dateStr === todayStr, events: calendarData[dateStr] || [] });
    }
    return cells;
  }, [month, year, calendarData]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await interviewsApi.schedule(scheduleForm);
      setShowSchedule(false);
      fetchData();
    } catch { /* ignore */ }
  };

  const handleCancel = async (id) => {
    try { await interviewsApi.cancel(id); fetchData(); } catch { /* ignore */ }
  };

  if (loading) return <div style={styles.loading}>⏳ Loading interviews...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.title}>📅 Interview Calendar</h1>
          <p style={styles.subtitle}>{upcoming.length} upcoming interview{upcoming.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={styles.viewToggle}>
            <button style={styles.toggleBtn(view === 'calendar')} onClick={() => setView('calendar')} id="view-calendar-btn">Calendar</button>
            <button style={styles.toggleBtn(view === 'list')} onClick={() => setView('list')} id="view-list-btn">List</button>
          </div>
          {user?.role === 'recruiter' && (
            <button style={styles.scheduleBtn} onClick={() => setShowSchedule(true)} id="schedule-interview-btn">
              + Schedule
            </button>
          )}
        </div>
      </div>

      {view === 'calendar' ? (
        <>
          <div style={styles.navRow}>
            <button style={styles.navBtn} onClick={() => navigateMonth(-1)} id="prev-month-btn">← Prev</button>
            <span style={styles.monthLabel}>{MONTHS[month - 1]} {year}</span>
            <button style={styles.navBtn} onClick={() => navigateMonth(1)} id="next-month-btn">Next →</button>
          </div>
          <div style={{ ...styles.calGrid, marginTop: 16 }}>
            {DAYS.map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
            {calendarGrid.map((cell, i) => {
              if (!cell) return <div key={`e${i}`} style={styles.emptyDay} />;
              return (
                <div key={cell.dateStr} style={styles.dayCell(cell.isToday, cell.events.length > 0)}>
                  <div style={styles.dayNum(cell.isToday)}>{cell.day}</div>
                  {cell.events.slice(0, 3).map((ev, j) => (
                    <span key={j} style={styles.dayLabel}>
                      <span style={styles.dayDot(STATUS_COLORS[ev.status] || '#6366f1')} />
                      {TYPE_ICONS[ev.type] || '📋'} {ev.jobId?.title?.substring(0, 18) || 'Interview'}
                    </span>
                  ))}
                  {cell.events.length > 3 && (
                    <span style={{ fontSize: 10, color: '#6366f1' }}>+{cell.events.length - 3} more</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={styles.listView}>
          {upcoming.length === 0 ? (
            <div style={styles.empty}>No upcoming interviews scheduled</div>
          ) : (
            upcoming.map(iv => {
              const d = new Date(iv.scheduledAt);
              return (
                <div key={iv._id} style={styles.interviewCard} id={`interview-card-${iv._id}`}>
                  <div style={styles.cardLeft}>
                    <span style={styles.cardDay}>{d.getDate()}</span>
                    <span style={styles.cardMonth}>{MONTHS[d.getMonth()]?.slice(0, 3)}</span>
                    <span style={styles.cardTime}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={styles.cardRight}>
                    <h3 style={styles.cardTitle}>{iv.jobId?.title || 'Interview'}</h3>
                    <p style={styles.cardCompany}>{iv.jobId?.company || ''} {iv.jobId?.location ? `• ${iv.jobId.location}` : ''}</p>
                    <div style={styles.metaRow}>
                      <span style={styles.badge('rgba(99,102,241,0.15)', '#a78bfa')}>
                        {TYPE_ICONS[iv.type]} {iv.type}
                      </span>
                      <span style={styles.badge(`${STATUS_COLORS[iv.status]}1a`, STATUS_COLORS[iv.status])}>
                        {iv.status}
                      </span>
                      <span style={styles.badge('rgba(148,163,184,0.1)', '#94a3b8')}>
                        ⏱ {iv.duration}min
                      </span>
                    </div>
                    {iv.meetingLink && (
                      <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        🔗 Join Meeting
                      </a>
                    )}
                    {iv.location && <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 12 }}>📍 {iv.location}</span>}
                    {iv.notes && <p style={styles.notes}>📝 {iv.notes}</p>}
                  </div>
                  {iv.status === 'scheduled' && (
                    <button style={styles.cancelInterviewBtn} onClick={() => handleCancel(iv._id)}>Cancel</button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {showSchedule && (
        <div style={styles.modal} onClick={() => setShowSchedule(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>📅 Schedule Interview</h2>
            <form onSubmit={handleSchedule}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Candidate ID</label>
                  <input style={styles.input} value={scheduleForm.candidateId}
                    onChange={e => setScheduleForm(f => ({ ...f, candidateId: e.target.value }))} required id="sched-candidate" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job ID</label>
                  <input style={styles.input} value={scheduleForm.jobId}
                    onChange={e => setScheduleForm(f => ({ ...f, jobId: e.target.value }))} required id="sched-job" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date & Time</label>
                  <input style={styles.input} type="datetime-local" value={scheduleForm.scheduledAt}
                    onChange={e => setScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))} required id="sched-datetime" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration (min)</label>
                  <input style={styles.input} type="number" value={scheduleForm.duration} min={15} max={480}
                    onChange={e => setScheduleForm(f => ({ ...f, duration: e.target.value }))} id="sched-duration" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Type</label>
                  <select style={styles.select} value={scheduleForm.type}
                    onChange={e => setScheduleForm(f => ({ ...f, type: e.target.value }))} id="sched-type">
                    <option value="video">📹 Video</option>
                    <option value="phone">📞 Phone</option>
                    <option value="in-person">🏢 In-Person</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Meeting Link</label>
                  <input style={styles.input} value={scheduleForm.meetingLink}
                    onChange={e => setScheduleForm(f => ({ ...f, meetingLink: e.target.value }))} id="sched-link" />
                </div>
              </div>
              <div style={{ ...styles.formGroup, marginTop: 12 }}>
                <label style={styles.label}>Notes</label>
                <textarea style={{ ...styles.input, minHeight: 70, resize: 'vertical' }} value={scheduleForm.notes}
                  onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))} id="sched-notes" />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowSchedule(false)}>Cancel</button>
                <button type="submit" style={styles.scheduleBtn} id="sched-submit-btn">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
