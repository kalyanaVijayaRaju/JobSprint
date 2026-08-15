import { X, MapPin, Briefcase, DollarSign, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { Badge, Button } from '../ui';

/**
 * JobComparisonDrawer — compare up to 3 jobs side by side.
 */
export default function JobComparisonDrawer({ jobs = [], onClose, onRemove }) {
  if (jobs.length === 0) return null;

  const fields = [
    { key: 'company', label: 'Company', icon: Building2, render: (j) => j.companyId?.name || j.company || '—' },
    { key: 'location', label: 'Location', icon: MapPin, render: (j) => j.location || '—' },
    { key: 'locationType', label: 'Work Type', icon: Briefcase, render: (j) => (j.locationType || '—').charAt(0).toUpperCase() + (j.locationType || '').slice(1) },
    { key: 'jobType', label: 'Job Type', icon: Clock, render: (j) => (j.jobType || '—').replace('-', ' ') },
    {
      key: 'salary', label: 'Salary Range', icon: DollarSign, render: (j) => {
        const sr = j.salaryRange;
        if (!sr || (!sr.min && !sr.max)) return '—';
        const currency = sr.currency || 'INR';
        const format = (n) => currency === 'INR'
          ? `₹${(n / 100000).toFixed(1)}L`
          : `$${(n / 1000).toFixed(0)}K`;
        return `${format(sr.min || 0)} – ${format(sr.max || 0)}`;
      }
    },
    {
      key: 'skills', label: 'Skills', icon: CheckCircle2, render: (j) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(j.skillsRequired || []).slice(0, 5).map((s) => (
            <Badge key={s} style={{ fontSize: '11px', padding: '2px 6px' }}>{s}</Badge>
          ))}
          {(j.skillsRequired || []).length > 5 && (
            <Badge style={{ fontSize: '11px', padding: '2px 6px' }}>+{j.skillsRequired.length - 5}</Badge>
          )}
        </div>
      )
    },
    {
      key: 'posted', label: 'Posted', icon: Clock, render: (j) => j.createdAt
        ? new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—'
    },
    {
      key: 'expires', label: 'Expires', icon: Clock, render: (j) => j.expiresAt
        ? new Date(j.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—'
    }
  ];

  return (
    <div className="job-compare-overlay">
      <div className="job-compare-drawer">
        <div className="job-compare-header">
          <h3 style={{ margin: 0, fontWeight: 700 }}>Compare Jobs ({jobs.length}/3)</h3>
          <button type="button" className="job-compare-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="job-compare-table">
          {/* Job title headers */}
          <div className="job-compare-row header">
            <div className="job-compare-label">Job Title</div>
            {jobs.map((job) => (
              <div key={job._id || job.id} className="job-compare-cell header-cell">
                <span className="job-compare-title">{job.title}</span>
                <button
                  type="button"
                  className="job-compare-remove"
                  onClick={() => onRemove(job._id || job.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {/* Empty cells to maintain 3-column layout */}
            {Array.from({ length: 3 - jobs.length }).map((_, i) => (
              <div key={`empty-${i}`} className="job-compare-cell empty">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add a job</span>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="job-compare-row">
                <div className="job-compare-label">
                  <Icon size={14} style={{ marginRight: 6, opacity: 0.6 }} />
                  {field.label}
                </div>
                {jobs.map((job) => (
                  <div key={job._id || job.id} className="job-compare-cell">
                    {field.render(job)}
                  </div>
                ))}
                {Array.from({ length: 3 - jobs.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="job-compare-cell empty">—</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
