import { useState } from 'react';
import { FileText, User, ExternalLink, Calendar, MessageSquare, MoreVertical, Sparkles } from 'lucide-react';
import { Badge } from '../ui';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: '#6366f1', bg: '#e0e7ff' },
  { id: 'screening', title: 'Screening', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'interviewing', title: 'Interviewing', color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'offered', title: 'Offered', color: '#10b981', bg: '#d1fae5' },
  { id: 'rejected', title: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
];

/**
 * Interactive drag-and-drop Kanban Board for managing applicant pipeline stages.
 * Features optimistic status updates, drag animations, and candidate skill match indicators.
 */
export default function KanbanBoard({
  applicants = [],
  onUpdateStatus,
  onSelectApplication,
  selectedApplication,
  jobRequiredSkills = [],
  onScheduleInterview,
  onAddNote,
}) {
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  const [draggingCardId, setDraggingCardId] = useState(null);

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingCardId(appId);
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (draggedOverColumn !== columnId) {
      setDraggedOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    setDraggingCardId(null);
    const appId = e.dataTransfer.getData('text/plain');
    if (appId) {
      await onUpdateStatus(appId, columnId);
    }
  };

  // Compute skill match score if job requirements are available
  const getSkillMatch = (candidateSkills = []) => {
    if (!jobRequiredSkills || jobRequiredSkills.length === 0 || !candidateSkills || candidateSkills.length === 0) {
      return null;
    }
    const reqSet = new Set(jobRequiredSkills.map((s) => s.toLowerCase()));
    const matched = candidateSkills.filter((s) => reqSet.has(s.toLowerCase()));
    const score = Math.round((matched.length / reqSet.size) * 100);
    return { score, matchedCount: matched.length, totalCount: reqSet.size };
  };

  // Group applicants by status
  const groupedApplicants = COLUMNS.reduce((acc, col) => {
    acc[col.id] = applicants.filter((app) => app.status === col.id);
    return acc;
  }, {});

  return (
    <div
      className="kanban-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))',
        gap: '16px',
        marginTop: '20px',
        overflowX: 'auto',
        paddingBottom: '16px',
      }}
    >
      {COLUMNS.map((col) => {
        const columnApps = groupedApplicants[col.id] || [];
        const isDraggedOver = draggedOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`kanban-column ${isDraggedOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{
              background: 'var(--color-card)',
              borderRadius: '16px',
              border: `2px solid ${isDraggedOver ? col.color : 'var(--color-border)'}`,
              boxShadow: isDraggedOver ? `0 0 16px ${col.color}33` : 'none',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '240px',
              maxHeight: 'calc(100vh - 260px)',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Column Header */}
            <div
              className="kanban-column-header"
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: col.color,
                  }}
                />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  {col.title}
                </h4>
              </div>
              <Badge style={{ background: col.bg, color: col.color, fontWeight: '800' }}>
                {columnApps.length}
              </Badge>
            </div>

            {/* Column Body */}
            <div
              className="kanban-column-body"
              style={{
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                flexGrow: 1,
              }}
            >
              {columnApps.length === 0 ? (
                <div
                  style={{
                    padding: '32px 12px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    border: '1.5px dashed var(--color-border)',
                    borderRadius: '12px',
                    background: isDraggedOver ? `${col.color}11` : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Drop candidate here
                </div>
              ) : (
                columnApps.map((app) => {
                  const candidateName =
                    app.candidateId?.firstName && app.candidateId?.lastName
                      ? `${app.candidateId.firstName} ${app.candidateId.lastName}`
                      : app.candidateId?.email?.split('@')[0] || 'Applicant';

                  const isSelected = selectedApplication?._id === app._id;
                  const isDragging = draggingCardId === app._id;
                  const match = getSkillMatch(app.candidateId?.skills);

                  return (
                    <div
                      key={app._id}
                      className={`kanban-card ${isSelected ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectApplication(app)}
                      style={{
                        padding: '14px',
                        background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg)',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        cursor: 'grab',
                        opacity: isDragging ? 0.4 : 1,
                        transform: isDragging ? 'scale(0.96)' : 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      }}
                    >
                      {/* Name & Match Badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <User size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                          <strong
                            style={{
                              fontSize: '13px',
                              color: 'var(--color-text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {candidateName}
                          </strong>
                        </div>
                        {match && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: match.score >= 70 ? '#d1fae5' : '#fef3c7',
                              color: match.score >= 70 ? '#065f46' : '#92400e',
                              flexShrink: 0,
                            }}
                          >
                            {match.score}% match
                          </span>
                        )}
                      </div>

                      {/* Applied Date */}
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          marginBottom: '10px',
                        }}
                      >
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </div>

                      {/* Card Action Chips */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                              fontWeight: '600',
                            }}
                          >
                            <FileText size={12} /> Resume <ExternalLink size={10} />
                          </a>
                        )}

                        {onScheduleInterview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleInterview(app);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '11px',
                              color: 'var(--color-accent)',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: 0,
                            }}
                          >
                            <Calendar size={11} /> Interview
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
