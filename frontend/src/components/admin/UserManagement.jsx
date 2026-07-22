import { Search, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { Button, Badge, Spinner, EmptyState, Pagination } from '../ui';

/**
 * User management table with filters and status toggle dialog triggering.
 */
export default function UserManagement({
  users = [],
  loading,
  error,
  pagination,
  filters,
  setFilters,
  onFetch,
  onOpenStatusDialog,
}) {
  return (
    <div>
      {/* Filter toolbar */}
      <div className="filter-pane-header" style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search users by email..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          style={{ width: '150px' }}
        >
          <option value="">All Roles</option>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
          style={{ width: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <Button variant="outline" icon={<RefreshCw size={14} />} onClick={() => onFetch(1)}>
          Filter
        </Button>
      </div>

      {loading ? (
        <Spinner size="lg" label="Loading users..." />
      ) : error ? (
        <EmptyState title="Failed to load users" description={error} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="No users match the selected criteria." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong className="cell-primary">{u.email}</strong>
                    </td>
                    <td>
                      <Badge variant="job-type">{u.role}</Badge>
                    </td>
                    <td>
                      <Badge variant={u.isActive ? 'active' : 'closed'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.isVerified ? 'success' : 'warning'}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          style={{
                            borderColor: u.isActive ? '#e11d48' : '#059669',
                            color: u.isActive ? '#e11d48' : '#059669',
                          }}
                          onClick={() => onOpenStatusDialog(u, !u.isActive)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
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
