import { useEffect, useState } from 'react';
import { Users, FileSpreadsheet } from 'lucide-react';
import { adminApi } from '../../api/client.js';
import UserManagement from './UserManagement.jsx';
import AuditLogViewer from './AuditLogViewer.jsx';
import StatusChangeDialog from './StatusChangeDialog.jsx';
import { Tabs } from '../ui';

/**
 * Main AdminDashboard component — user account controls and security audit log analysis.
 */
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

  // Fetch Users
  const fetchUsers = (page = 1) => {
    setUsersLoading(true);
    setUsersError(null);
    const params = {
      page,
      limit: 10,
      role: usersFilters.role || undefined,
      isActive: usersFilters.isActive !== '' ? usersFilters.isActive : undefined,
      search: usersFilters.search || undefined,
    };

    adminApi
      .listUsers(params)
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
      from: logsFilters.from || undefined,
      to: logsFilters.to || undefined,
    };

    adminApi
      .auditLogs(params)
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
    if (activeSubTab === 'users') fetchUsers(1);
    else if (activeSubTab === 'audit') fetchAuditLogs(1);
  }, [activeSubTab]);

  const handleStatusSubmit = async () => {
    if (!statusDialog.user || !statusDialog.reason.trim()) return;
    setStatusSubmitting(true);
    try {
      await adminApi.updateUserStatus(statusDialog.user._id, {
        isActive: statusDialog.isActive,
        reason: statusDialog.reason,
      });
      setStatusDialog({ open: false, user: null, isActive: false, reason: '' });
      fetchUsers(usersPagination.page);
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const adminTabs = [
    { id: 'users', label: 'User Management', icon: <Users size={16} /> },
    { id: 'audit', label: 'Security Audit Logs', icon: <FileSpreadsheet size={16} /> },
  ];

  return (
    <div className="tab-content">
      <div className="admin-container">
        <Tabs tabs={adminTabs} activeTab={activeSubTab} onChange={setActiveSubTab} style={{ marginBottom: '24px' }} />

        <Tabs.Panel id="users" activeTab={activeSubTab}>
          <UserManagement
            users={users}
            loading={usersLoading}
            error={usersError}
            pagination={usersPagination}
            filters={usersFilters}
            setFilters={setUsersFilters}
            onFetch={fetchUsers}
            onOpenStatusDialog={(u, isActive) =>
              setStatusDialog({ open: true, user: u, isActive, reason: '' })
            }
          />
        </Tabs.Panel>

        <Tabs.Panel id="audit" activeTab={activeSubTab}>
          <AuditLogViewer
            logs={logs}
            loading={logsLoading}
            error={logsError}
            pagination={logsPagination}
            filters={logsFilters}
            setFilters={setLogsFilters}
            onFetch={fetchAuditLogs}
          />
        </Tabs.Panel>

        <StatusChangeDialog
          isOpen={statusDialog.open}
          onClose={() => setStatusDialog({ open: false, user: null, isActive: false, reason: '' })}
          targetUser={statusDialog.user}
          isActive={statusDialog.isActive}
          reason={statusDialog.reason}
          setReason={(reason) => setStatusDialog((prev) => ({ ...prev, reason }))}
          onSubmit={handleStatusSubmit}
          submitting={statusSubmitting}
        />
      </div>
    </div>
  );
}
