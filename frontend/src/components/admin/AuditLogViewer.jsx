import { useState } from 'react';
import { RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { Button, Badge, Spinner, EmptyState, Pagination } from '../ui';

/**
 * Audit Log security event viewer table with severity filters and JSON detail expansion.
 */
export default function AuditLogViewer({
  logs = [],
  loading,
  error,
  pagination,
  filters,
  setFilters,
  onFetch,
}) {
  const [expandedLogId, setExpandedLogId] = useState(null);

  const getSeverityBadgeVariant = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'location';
    }
  };

  return (
    <div>
      {/* Filter toolbar */}
      <div className="filter-pane-header" style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter by Action (e.g. LOGIN_FAILED)..."
          value={filters.action}
          onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={filters.severity}
          onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
          style={{ width: '150px' }}
        >
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <Button variant="outline" icon={<RefreshCw size={14} />} onClick={() => onFetch(1)}>
          Filter
        </Button>
      </div>

      {loading ? (
        <Spinner size="lg" label="Loading audit logs..." />
      ) : error ? (
        <EmptyState title="Failed to load audit logs" description={error} />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs found" description="No security audit events match the selected criteria." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Severity</th>
                  <th>User ID</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <strong className="cell-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} /> {log.action}
                      </strong>
                    </td>
                    <td>
                      <Badge variant={getSeverityBadgeVariant(log.severity)}>{log.severity}</Badge>
                    </td>
                    <td>
                      <span className="cell-secondary">{log.userId?._id || log.userId || 'System / Anonymous'}</span>
                    </td>
                    <td>{log.ipAddress || '—'}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedLogId(expandedLogId === log._id ? null : log._id)}
                      >
                        {expandedLogId === log._id ? 'Hide Details' : 'View Details'}
                      </Button>
                      {expandedLogId === log._id && (
                        <div
                          style={{
                            marginTop: '8px',
                            background: 'var(--color-bg)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        >
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {JSON.stringify(log.details || {}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onPageChange={(page) => onFetch(page)}
          />
        </>
      )}
    </div>
  );
}
