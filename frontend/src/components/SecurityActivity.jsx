import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield, Globe, Monitor, Calendar } from 'lucide-react';
import { authApi } from '../api/client.js';

export default function SecurityActivity() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivity = (page = 1) => {
    setLoading(true);
    setError(null);
    authApi.securityActivity({ page, limit: 10 })
      .then((res) => {
        if (res.success && res.data) {
          setEvents(res.data.events);
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load security activity logs');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivity(1);
  }, []);

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'badge-danger';
      case 'warning':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('failed') || action.includes('locked')) {
      return <ShieldAlert size={16} className="text-error" />;
    }
    if (action.includes('success') || action.includes('changed')) {
      return <ShieldCheck size={16} className="text-success" />;
    }
    return <Shield size={16} className="text-muted" />;
  };

  const formatActionName = (action) => {
    return action
      .replace('auth.', '')
      .replace('_', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="security-card activity-log-card">
      <div className="security-card-header">
        <ShieldCheck size={20} />
        <h3>Security Activity Log</h3>
      </div>
      <p className="card-description">
        Review recent security events related to your account, such as login attempts, account lockouts, and password modifications.
      </p>

      {error && (
        <div className="security-alert security-alert-error" style={{ marginBottom: '16px' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="table-loader-wrapper">
          <div className="loader-spinner"></div>
          <p>Loading security logs...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state-panel">
          <Shield size={36} className="empty-icon text-muted" />
          <p className="empty-title">No activity logs recorded</p>
          <p className="empty-subtitle">Only security-relevant actions will be shown here.</p>
        </div>
      ) : (
        <div className="security-table-container">
          <table className="security-table">
            <thead>
              <tr>
                <th>Event / Action</th>
                <th>Severity</th>
                <th>IP Address</th>
                <th>Device / User Agent</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="event-action-cell">
                    {getActionIcon(event.action)}
                    <span className="action-text">{formatActionName(event.action)}</span>
                  </td>
                  <td>
                    <span className={`badge ${getSeverityBadgeClass(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="ip-cell">
                    <Globe size={14} />
                    <span>{event.ipAddress || 'unknown'}</span>
                  </td>
                  <td className="ua-cell" title={event.userAgent}>
                    <Monitor size={14} />
                    <span className="ua-text">{event.userAgent || 'unknown'}</span>
                  </td>
                  <td className="time-cell">
                    <Calendar size={14} />
                    <span>{formatDate(event.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="pagination-bar">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchActivity(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => fetchActivity(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
