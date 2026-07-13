import { useEffect, useState } from 'react';
import { Users, FileSpreadsheet, Search, RefreshCw, UserCheck, UserX, Shield, Globe, Monitor, Calendar, AlertTriangle } from 'lucide-react';
import { adminApi } from '../api/client.js';

export default function AdminDashboard({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'audit'
  
  // Users state
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [usersFilters, setUsersFilters] = useState({ role: '', isActive: '', search: '' });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // Status Change Dialog State
  const [statusDialog, setStatusDialog] = useState({ open: false, user: null, isActive: false, reason: '' });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Audit logs state
  const [logs, setLogs] = useState([]);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [logsFilters, setLogsFilters] = useState({ userId: '', action: '', severity: '', from: '', to: '' });
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  
  // For JSON view in audit logs
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Fetch Users
  const fetchUsers = (page = 1) => {
    setUsersLoading(true);
    setUsersError(null);
    const params = {
      page,
      limit: 10,
      role: usersFilters.role || undefined,
      isActive: usersFilters.isActive !== '' ? usersFilters.isActive : undefined,
      search: usersFilters.search || undefined
    };

    adminApi.listUsers(params)
      .then((res) => {
        if (res.success && res.data) {
          setUsers(res.data.users);
          setUsersPagination(res.data.pagination);
        }
      })
      .catch((err) => setUsersError(err.message || 'Failed to fetch users list'))
      .finally(() => setUsersLoading(false));
  };

  // Fetch Audit Logs
  const fetchAuditLogs = (page = 1) => {
    setLogsLoading(true);
    setLogsError(null);
    const params = {
      page,
      limit: 10,
      userId: logsFilters.userId || undefined,
      action: logsFilters.action || undefined,
      severity: logsFilters.severity || undefined,
      from: logsFilters.from ? new Date(logsFilters.from).toISOString() : undefined,
      to: logsFilters.to ? new Date(logsFilters.to).toISOString() : undefined
    };

    adminApi.auditLogs(params)
      .then((res) => {
        if (res.success && res.data) {
          setLogs(res.data.logs);
          setLogsPagination(res.data.pagination);
        }
      })
      .catch((err) => setLogsError(err.message || 'Failed to fetch audit logs'))
      .finally(() => setLogsLoading(false));
  };

  useEffect(() => {
    if (activeSubTab === 'users') {
      fetchUsers(1);
    } else {
      fetchAuditLogs(1);
    }
  }, [activeSubTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeSubTab === 'users') {
      fetchUsers(1);
    } else {
      fetchAuditLogs(1);
    }
  };

  const openStatusDialog = (targetUser, targetStatus) => {
    setStatusDialog({
      open: true,
      user: targetUser,
      isActive: targetStatus,
      reason: ''
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({ open: false, user: null, isActive: false, reason: '' });
  };

  const handleStatusChangeSubmit = async (e) => {
    e.preventDefault();
    if (!statusDialog.user) return;
    
    setStatusSubmitting(true);
    try {
      await adminApi.updateUserStatus(statusDialog.user.id, {
        isActive: statusDialog.isActive,
        reason: statusDialog.reason
      });
      closeStatusDialog();
      fetchUsers(usersPagination.page);
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const formatSeverityClass = (sev) => {
    switch (sev) {
      case 'critical': return 'badge-danger';
      case 'warning': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <div className="tab-content admin-dashboard-content">
      {/* Sub tabs navigation */}
      <div className="admin-subtabs">
        <button
          type="button"
          className={`admin-subtab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('users')}
        >
          <Users size={16} /> User Directory
        </button>
        <button
          type="button"
          className={`admin-subtab-btn ${activeSubTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('audit')}
        >
          <FileSpreadsheet size={16} /> Global Audit Logs
        </button>
      </div>

      {activeSubTab === 'users' && (
        <div className="admin-panel-card">
          <div className="panel-header-actions">
            <h3>Registered JobSprint Users</h3>
            <button type="button" className="btn btn-icon btn-outline" onClick={() => fetchUsers(1)} title="Refresh User Directory">
              <RefreshCw size={16} />
            </button>
          </div>

          {/* User directory filters */}
          <form onSubmit={handleSearchSubmit} className="admin-filters-grid">
            <div className="form-group">
              <label htmlFor="search-email">Search email</label>
              <div className="search-input-wrapper">
                <input
                  id="search-email"
                  type="text"
                  placeholder="user@example.com"
                  value={usersFilters.search}
                  onChange={(e) => setUsersFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <button type="submit" className="search-btn"><Search size={14} /></button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="filter-role">Role</label>
              <select
                id="filter-role"
                value={usersFilters.role}
                onChange={(e) => {
                  setUsersFilters(prev => ({ ...prev, role: e.target.value }));
                  setTimeout(() => fetchUsers(1), 0);
                }}
              >
                <option value="">All Roles</option>
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                value={usersFilters.isActive}
                onChange={(e) => {
                  setUsersFilters(prev => ({ ...prev, isActive: e.target.value }));
                  setTimeout(() => fetchUsers(1), 0);
                }}
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Deactivated Only</option>
              </select>
            </div>
          </form>

          {usersError && <div className="security-alert security-alert-error">{usersError}</div>}

          {usersLoading && users.length === 0 ? (
            <div className="table-loader-wrapper">
              <div className="loader-spinner"></div>
              <p>Fetching registered users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state-panel">
              <Users size={36} className="empty-icon text-muted" />
              <p className="empty-title">No users found</p>
              <p className="empty-subtitle">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="security-table-container">
              <table className="security-table">
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Created Date</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.email}</td>
                      <td>
                        <span className="user-role-badge">{item.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {item.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString() : 'Never'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {item.id === user.id ? (
                          <span className="text-muted" style={{ fontSize: '12px' }}>Your Account</span>
                        ) : item.isActive ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline text-error border-error-btn"
                            onClick={() => openStatusDialog(item, false)}
                          >
                            <UserX size={14} style={{ marginRight: '4px' }} /> Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline text-success border-success-btn"
                            onClick={() => openStatusDialog(item, true)}
                          >
                            <UserCheck size={14} style={{ marginRight: '4px' }} /> Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usersPagination.pages > 1 && (
                <div className="pagination-bar">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={usersPagination.page <= 1 || usersLoading}
                    onClick={() => fetchUsers(usersPagination.page - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {usersPagination.page} of {usersPagination.pages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={usersPagination.page >= usersPagination.pages || usersLoading}
                    onClick={() => fetchUsers(usersPagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'audit' && (
        <div className="admin-panel-card">
          <div className="panel-header-actions">
            <h3>Global System Audit Trail</h3>
            <button type="button" className="btn btn-icon btn-outline" onClick={() => fetchAuditLogs(1)} title="Refresh logs">
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Audit filters */}
          <form onSubmit={handleSearchSubmit} className="admin-filters-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="form-group">
              <label htmlFor="filter-log-user">User ID</label>
              <input
                id="filter-log-user"
                type="text"
                placeholder="User ID (optional)"
                value={logsFilters.userId}
                onChange={(e) => setLogsFilters(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="filter-log-action">Action Type</label>
              <input
                id="filter-log-action"
                type="text"
                placeholder="e.g. auth.login_failed"
                value={logsFilters.action}
                onChange={(e) => setLogsFilters(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="filter-log-severity">Severity</label>
              <select
                id="filter-log-severity"
                value={logsFilters.severity}
                onChange={(e) => {
                  setLogsFilters(prev => ({ ...prev, severity: e.target.value }));
                  setTimeout(() => fetchAuditLogs(1), 0);
                }}
              >
                <option value="">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filter-log-from">From Date</label>
              <input
                id="filter-log-from"
                type="date"
                value={logsFilters.from}
                onChange={(e) => setLogsFilters(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="filter-log-to">To Date</label>
              <input
                id="filter-log-to"
                type="date"
                value={logsFilters.to}
                onChange={(e) => setLogsFilters(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-block">Filter logs</button>
            </div>
          </form>

          {logsError && <div className="security-alert security-alert-error">{logsError}</div>}

          {logsLoading && logs.length === 0 ? (
            <div className="table-loader-wrapper">
              <div className="loader-spinner"></div>
              <p>Fetching system logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state-panel">
              <FileSpreadsheet size={36} className="empty-icon text-muted" />
              <p className="empty-title">No audit logs found</p>
              <p className="empty-subtitle">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="security-table-container">
              <table className="security-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>User Profile</th>
                    <th>Severity</th>
                    <th>Source IP</th>
                    <th>Device Details</th>
                    <th>Timestamp</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.action}</td>
                      <td>
                        {log.user ? (
                          <div className="audit-user-info">
                            <span className="audit-email">{log.user.email}</span>
                            <span className="audit-subrole">({log.user.role})</span>
                          </div>
                        ) : (
                          <span className="text-muted">system / anonymous</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${formatSeverityClass(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td>
                        <Globe size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {log.ipAddress || 'unknown'}
                      </td>
                      <td className="ua-cell" title={log.userAgent}>
                        <Monitor size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {log.userAgent || 'unknown'}
                      </td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        >
                          {expandedLogId === log.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expandedLogId && (
                <div className="expanded-log-details">
                  <h4>Event Details Payload</h4>
                  <pre>
                    {JSON.stringify(logs.find(l => l.id === expandedLogId)?.details || {}, null, 2)}
                  </pre>
                </div>
              )}

              {logsPagination.pages > 1 && (
                <div className="pagination-bar">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={logsPagination.page <= 1 || logsLoading}
                    onClick={() => fetchAuditLogs(logsPagination.page - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {logsPagination.page} of {logsPagination.pages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={logsPagination.page >= logsPagination.pages || logsLoading}
                    onClick={() => fetchAuditLogs(logsPagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog for Activation/Deactivation */}
      {statusDialog.open && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <AlertTriangle className={statusDialog.isActive ? 'text-success' : 'text-error'} size={24} />
              <h3>Confirm Account {statusDialog.isActive ? 'Activation' : 'Deactivation'}</h3>
            </div>
            
            <form onSubmit={handleStatusChangeSubmit} className="modal-form">
              <p>
                Are you sure you want to {statusDialog.isActive ? 'activate' : 'deactivate'} the account for{' '}
                <strong>{statusDialog.user.email}</strong>?
              </p>
              {!statusDialog.isActive && (
                <p className="modal-subtext">
                  This user will be logged out immediately and blocked from signing in or executing operations.
                </p>
              )}

              <div className="form-group">
                <label htmlFor="status-change-reason">Reason for Status Change</label>
                <textarea
                  id="status-change-reason"
                  rows={3}
                  placeholder="Provide a detailed administrative reason..."
                  value={statusDialog.reason}
                  onChange={(e) => setStatusDialog(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeStatusDialog} disabled={statusSubmitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${statusDialog.isActive ? 'btn-success' : 'btn-danger'}`}
                  disabled={statusSubmitting}
                >
                  {statusSubmitting ? 'Processing...' : statusDialog.isActive ? 'Activate Account' : 'Deactivate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
