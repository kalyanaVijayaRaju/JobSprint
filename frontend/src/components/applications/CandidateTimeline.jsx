import { BriefcaseBusiness, Clock, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button, Badge, EmptyState, ConfirmDialog } from '../ui';
import { useState } from 'react';

/**
 * Candidate view listing submitted applications with timeline status progression and withdraw options.
 */
export default function CandidateTimeline({
  myApps = [],
  loading = false,
  onWithdraw,
  withdrawingApplicationId,
  onBrowseJobs,
}) {
  const [withdrawDialog, setWithdrawDialog] = useState({ open: false, appId: null });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p>Loading your submitted applications...</p>
      </div>
    );
  }

  if (myApps.length === 0) {
    return (
      <EmptyState
        icon={<BriefcaseBusiness size={40} />}
        title="No submitted applications"
        description="You haven't submitted any job applications yet."
        action={
          <Button variant="primary" onClick={onBrowseJobs}>
            Browse Open Roles
          </Button>
        }
      />
    );
  }

  return (
    <div className="candidate-applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {myApps.map((app) => (
        <div
          key={app._id}
          className="card"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700' }}>
                {app.jobId?.title || 'Job Position'}
              </h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: '600' }}>
                {app.jobId?.companyId?.name || 'Company Details'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge variant={`status-${app.status}`}>{app.status}</Badge>
              {app.status !== 'withdrawn' && app.status !== 'rejected' && (
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderColor: '#e11d48', color: '#e11d48' }}
                  onClick={() => setWithdrawDialog({ open: true, appId: app._id })}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span>
              <Clock size={14} /> Applied on {new Date(app.createdAt).toLocaleDateString()}
            </span>
            {app.resumeUrl && (
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--color-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                <FileText size={14} /> Resume PDF <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Status Timeline History */}
          {app.statusTimeline?.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '10px',
                }}
              >
                Progress History
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {app.statusTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      background: 'var(--color-bg)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <Badge variant={`status-${item.status}`}>{item.status}</Badge>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <ConfirmDialog
        isOpen={withdrawDialog.open}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmLabel="Withdraw"
        onConfirm={() => {
          if (withdrawDialog.appId) onWithdraw(withdrawDialog.appId);
          setWithdrawDialog({ open: false, appId: null });
        }}
        onCancel={() => setWithdrawDialog({ open: false, appId: null })}
      />
    </div>
  );
}
