import { useState } from 'react';
import { FileText, User, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '../ui';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: '#6366f1' },
  { id: 'screening', title: 'Screening', color: '#f59e0b' },
  { id: 'interviewing', title: 'Interviewing', color: '#0ea5e9' },
  { id: 'offered', title: 'Offered', color: '#10b981' },
  { id: 'rejected', title: 'Rejected', color: '#ef4444' },
];

/**
 * Interactive drag-and-drop Kanban Board for managing applicant pipeline stages.
 */
export default function KanbanBoard({
  applicants = [],
  onUpdateStatus,
  onSelectApplication,
  selectedApplication,
  candidateSkills = [],
}) {
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const appId = e.dataTransfer.getData('text/plain');
    if (appId) {
      await onUpdateStatus(appId, columnId);
    }
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
        gridTemplateColumns: 'repeat(5, 1fr)',
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
              border: `1px solid ${isDraggedOver ? col.color : 'var(--color-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              minWidth: '220px',
              maxHeight: 'calc(100vh - 280px)',
            }}
          >
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
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{col.title}</h4>
              </div>
              <Badge>{columnApps.length}</Badge>
            </div>

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
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    border: '1px dashed var(--color-border)',
                    borderRadius: '12px',
                  }}
                >
                  Drop here
                </div>
              ) : (
                columnApps.map((app) => {
                  const candidateName =
                    app.candidateId?.firstName && app.candidateId?.lastName
                      ? `${app.candidateId.firstName} ${app.candidateId.lastName}`
                      : app.candidateId?.email?.split('@')[0] || 'Applicant';

                  const isSelected = selectedApplication?._id === app._id;

                  return (
                    <div
                      key={app._id}
                      className={`kanban-card ${isSelected ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app._id)}
                      onClick={() => onSelectApplication(app)}
                      style={{
                        padding: '14px',
                        background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg)',
                        borderRadius: '12px',
                        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        cursor: 'grab',
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <strong style={{ fontSize: '13px' }}>{candidateName}</strong>
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          marginBottom: '8px',
                        }}
                      >
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </div>

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
