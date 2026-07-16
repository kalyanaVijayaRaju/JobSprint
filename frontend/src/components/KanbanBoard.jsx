import { useState } from 'react';
import { FileText, User, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: '#6366f1' },
  { id: 'screening', title: 'Screening', color: '#f59e0b' },
  { id: 'interviewing', title: 'Interviewing', color: '#0ea5e9' },
  { id: 'offered', title: 'Offered', color: '#10b981' },
  { id: 'rejected', title: 'Rejected', color: '#ef4444' }
];

export default function KanbanBoard({
  applicants,
  onUpdateStatus,
  onSelectApplication,
  selectedApplication,
  candidateSkills = []
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
    acc[col.id] = applicants.filter(app => app.status === col.id);
    return acc;
  }, {});

  return (
    <div className="kanban-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
      {COLUMNS.map(col => {
        const columnApps = groupedApplicants[col.id] || [];
        const isDraggedOver = draggedOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`kanban-column ${isDraggedOver ? 'drag-over' : ''}`}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.id)}
            style={{
              background: 'var(--color-bg)',
              borderRadius: '20px',
              padding: '16px 12px',
              border: `2px dashed ${isDraggedOver ? col.color : 'transparent'}`,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '500px',
              minWidth: '220px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `2px solid ${col.color}`, paddingBottom: '8px' }}>
              <h4 style={{ margin: 0, fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }}></span>
                {col.title}
              </h4>
              <span style={{ fontSize: '11px', fontWeight: '800', background: 'var(--color-border)', padding: '2px 8px', borderRadius: '99px' }}>
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              {columnApps.map(app => {
                const isSelected = selectedApplication?._id === app._id;
                
                // Calculate match score if skills match is possible
                const requiredSkills = app.jobId?.skillsRequired || [];
                const candidateProfileSkills = app.candidateId?.skills || [];
                const candidateSkillsLower = candidateProfileSkills.map(s => s.toLowerCase());
                const matchingSkills = requiredSkills.filter(s => candidateSkillsLower.includes(s.toLowerCase()));
                const matchScore = requiredSkills.length > 0
                  ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
                  : 0;

                return (
                  <div
                    key={app._id}
                    draggable
                    onDragStart={e => handleDragStart(e, app._id)}
                    onClick={() => onSelectApplication(app)}
                    style={{
                      background: 'var(--color-card)',
                      border: `1px solid ${isSelected ? col.color : 'var(--color-border)'}`,
                      borderRadius: '16px',
                      padding: '12px',
                      cursor: 'grab',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '13px', fontWeight: '700', display: 'block' }}>
                        {app.candidateId?.firstName} {app.candidateId?.lastName}
                      </strong>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', wordBreak: 'break-all', display: 'block' }}>
                      {app.candidateId?.userId?.email}
                    </span>

                    {/* Skill Match Tag */}
                    {requiredSkills.length > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: matchScore >= 60 ? 'var(--color-success-light)' : 'var(--color-bg)', color: matchScore >= 60 ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: '600', alignSelf: 'flex-start' }}>
                        <Sparkles size={10} />
                        <span>{matchScore}% match</span>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}
                        >
                          <FileText size={10} /> Resume
                        </a>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>No resume</span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                        Details <ArrowRight size={10} style={{ marginLeft: '2px' }} />
                      </span>
                    </div>
                  </div>
                );
              })}

              {columnApps.length === 0 && (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24px 0', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Drop candidate here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
