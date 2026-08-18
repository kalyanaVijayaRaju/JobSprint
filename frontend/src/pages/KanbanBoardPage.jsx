import { useState, useEffect, useCallback } from 'react';
import { kanbanApi } from '../api/client.js';

const COLUMN_CONFIG = {
  applied:    { label: 'Applied',    color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  screening:  { label: 'Screening',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  interview:  { label: 'Interview',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  offer:      { label: 'Offer',      color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  hired:      { label: 'Hired',      color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  rejected:   { label: 'Rejected',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

const styles = {
  page: { padding: '28px 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  board: { display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 },
  column: (bg) => ({
    minWidth: 260, maxWidth: 300, flex: '1 0 260px',
    background: bg, borderRadius: 16, padding: '14px 12px',
    display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 180px)',
  }),
  columnHeader: (color) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 12, padding: '0 4px',
  }),
  columnDot: (color) => ({
    width: 10, height: 10, borderRadius: '50%', background: color,
    boxShadow: `0 0 8px ${color}66`,
  }),
  columnTitle: { fontSize: 13, fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' },
  columnCount: (color) => ({
    fontSize: 11, fontWeight: 600, color: color, background: `${color}1a`,
    borderRadius: 12, padding: '2px 8px', marginLeft: 'auto',
  }),
  cardList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  card: {
    background: 'rgba(30,41,59,0.7)', borderRadius: 12, padding: '14px 16px',
    cursor: 'grab', border: '1px solid rgba(148,163,184,0.1)',
    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.2s',
  },
  cardDragging: {
    opacity: 0.5, transform: 'rotate(3deg) scale(1.02)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  cardOver: { borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99,102,241,0.3)' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 },
  cardCompany: { fontSize: 12, color: '#94a3b8', margin: '4px 0 8px' },
  cardMeta: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badge: (bg, color) => ({
    fontSize: 11, fontWeight: 500, color, background: bg,
    borderRadius: 6, padding: '2px 8px',
  }),
  cardDate: { fontSize: 11, color: '#64748b', marginTop: 8 },
  emptyCol: { fontSize: 13, color: '#64748b', textAlign: 'center', padding: '32px 8px' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8', fontSize: 15 },
  error: { padding: '24px', color: '#f87171', fontSize: 14, background: 'rgba(239,68,68,0.08)', borderRadius: 12, margin: 20 },
  statsRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  stat: (color) => ({
    display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(30,41,59,0.6)',
    borderRadius: 10, padding: '8px 16px', border: `1px solid ${color}33`,
  }),
  statNum: (color) => ({ fontSize: 20, fontWeight: 700, color }),
  statLabel: { fontSize: 12, color: '#94a3b8' },
};

export default function KanbanBoardPage() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [moving, setMoving] = useState(null);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await kanbanApi.getBoard();
      setBoard(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const handleDragStart = (e, appId) => {
    setDraggedId(appId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    const appId = e.dataTransfer.getData('text/plain');
    if (!appId) return;
    setMoving(appId);
    try {
      await kanbanApi.moveCard(appId, colId);
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setMoving(null);
      setDraggedId(null);
    }
  };

  if (loading) return <div style={styles.loading}>⏳ Loading Kanban board...</div>;
  if (error) return <div style={styles.error}>❌ {error}</div>;
  if (!board) return null;

  const columns = board.columns || {};
  const colOrder = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Application Pipeline</h1>
        <p style={styles.subtitle}>Drag and drop applications between stages to update their status</p>
      </div>

      <div style={styles.statsRow}>
        {colOrder.map(colId => {
          const cfg = COLUMN_CONFIG[colId];
          const count = columns[colId]?.items?.length || 0;
          return (
            <div key={colId} style={styles.stat(cfg.color)}>
              <span style={styles.statNum(cfg.color)}>{count}</span>
              <span style={styles.statLabel}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      <div style={styles.board}>
        {colOrder.map(colId => {
          const cfg = COLUMN_CONFIG[colId];
          const items = columns[colId]?.items || [];
          const isOver = dragOverCol === colId;

          return (
            <div
              key={colId}
              style={{
                ...styles.column(cfg.bg),
                ...(isOver ? { outline: `2px solid ${cfg.color}`, outlineOffset: -2 } : {}),
              }}
              onDragOver={(e) => handleDragOver(e, colId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, colId)}
              id={`kanban-column-${colId}`}
            >
              <div style={styles.columnHeader(cfg.color)}>
                <div style={styles.columnDot(cfg.color)} />
                <span style={styles.columnTitle}>{cfg.label}</span>
                <span style={styles.columnCount(cfg.color)}>{items.length}</span>
              </div>

              <div style={styles.cardList}>
                {items.length === 0 ? (
                  <div style={styles.emptyCol}>No applications</div>
                ) : (
                  items.map(app => {
                    const isDragging = draggedId === app._id;
                    const isMoving = moving === app._id;
                    return (
                      <div
                        key={app._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app._id)}
                        onDragEnd={() => setDraggedId(null)}
                        style={{
                          ...styles.card,
                          ...(isDragging ? styles.cardDragging : {}),
                          ...(isMoving ? { opacity: 0.4 } : {}),
                        }}
                        id={`kanban-card-${app._id}`}
                      >
                        <p style={styles.cardTitle}>{app.jobId?.title || 'Unknown Position'}</p>
                        <p style={styles.cardCompany}>{app.jobId?.company || 'Unknown Company'}</p>
                        <div style={styles.cardMeta}>
                          {app.jobId?.location && (
                            <span style={styles.badge('rgba(59,130,246,0.15)', '#60a5fa')}>
                              📍 {app.jobId.location}
                            </span>
                          )}
                          {app.jobId?.jobType && (
                            <span style={styles.badge('rgba(16,185,129,0.15)', '#34d399')}>
                              {app.jobId.jobType}
                            </span>
                          )}
                        </div>
                        <div style={styles.cardDate}>
                          Applied {new Date(app.createdAt).toLocaleDateString()}
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
    </div>
  );
}
