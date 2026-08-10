import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Ban } from 'lucide-react';
import { adminApi } from '../../api/client.js';
import { Button, Badge } from '../ui';

/**
 * Content moderation queue with quick-action buttons for admin review.
 * Displays flagged or recently suspended users with inline status toggles.
 */
export default function FlaggedContent() {
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadFlagged();
  }, []);

  const loadFlagged = async () => {
    setLoading(true);
    try {
      // Load recently deactivated or suspicious accounts
      const res = await adminApi.listUsers({ isActive: 'false', limit: 20 });
      if (res.success && res.data) {
        setFlaggedUsers(res.data.users || []);
      }
    } catch {
      setFlaggedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user, newIsActive) => {
    setActionLoading(user._id);
    try {
      await adminApi.updateUserStatus(user._id, {
        isActive: newIsActive,
        reason: newIsActive ? 'Reinstated by admin from moderation panel' : 'Suspended from moderation panel'
      });
      await loadFlagged();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading flagged content...
      </div>
    );
  }

  if (flaggedUsers.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '40px',
          textAlign: 'center',
          animation: 'scaleUp 0.4s ease both',
        }}
      >
        <CheckCircle size={40} style={{ color: 'var(--color-success)', marginBottom: '12px' }} />
        <h4 style={{ margin: '0 0 8px', color: 'var(--color-text-main)' }}>All Clear!</h4>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '13px' }}>
          No flagged or suspended accounts found. The platform is clean.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'scaleUp 0.4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
          Moderation Queue
        </h4>
        <Badge>{flaggedUsers.length}</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {flaggedUsers.map((user, idx) => (
          <div
            key={user._id}
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
            }}
          >
            {/* User avatar */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: user.isActive ? 'var(--color-success-light)' : 'var(--color-error-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user.isActive ? (
                <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              ) : (
                <Ban size={18} style={{ color: 'var(--color-error)' }} />
              )}
            </div>

            {/* User info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                <span>·</span>
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Status badge */}
            <Badge
              style={{
                background: user.isActive ? 'var(--color-success-light)' : 'var(--color-error-light)',
                color: user.isActive ? 'var(--color-success)' : 'var(--color-error)',
                fontWeight: '700',
                fontSize: '11px',
              }}
            >
              {user.isActive ? 'Active' : 'Suspended'}
            </Badge>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {user.isActive ? (
                <Button
                  size="sm"
                  variant="outline"
                  style={{ fontSize: '11px', padding: '6px 10px', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  onClick={() => handleToggleStatus(user, false)}
                  disabled={actionLoading === user._id}
                >
                  <XCircle size={12} style={{ marginRight: '4px' }} />
                  Suspend
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  style={{ fontSize: '11px', padding: '6px 10px', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                  onClick={() => handleToggleStatus(user, true)}
                  disabled={actionLoading === user._id}
                >
                  <CheckCircle size={12} style={{ marginRight: '4px' }} />
                  Reinstate
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
