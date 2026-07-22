import { Bookmark, MapPin, DollarSign, Clock } from 'lucide-react';
import { Badge, Button } from '../ui';

/**
 * Single saved job item card with bookmark toggle, status badges, and apply details action.
 */
export default function SavedJobCard({
  savedItem,
  isApplied,
  onUnsave,
  onSelectJob,
}) {
  const job = savedItem.jobId || savedItem;
  const company = job.companyId?.name || 'Company Details';

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <h3>{job.title}</h3>
          <p className="job-company">{company}</p>
        </div>
        <button
          type="button"
          className="bookmark-btn active"
          onClick={() => onUnsave(job._id)}
          aria-label="Remove bookmark"
        >
          <Bookmark size={18} />
        </button>
      </div>

      <div className="job-tags">
        <Badge variant="job-type">{job.jobType}</Badge>
        <Badge variant="location">{job.locationType}</Badge>
        <Badge variant={`status-${job.status}`}>{job.status}</Badge>
      </div>

      <div className="job-metadata">
        <div className="meta-item">
          <MapPin size={14} />
          <span>{job.location}</span>
        </div>
        {job.salaryRange && (
          <div className="meta-item">
            <DollarSign size={14} />
            <span>
              {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()}{' '}
              {job.salaryRange.currency}
            </span>
          </div>
        )}
      </div>

      <div className="job-skills">
        {(job.skillsRequired || []).map((skill) => (
          <span key={skill} className="skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <div className="job-card-footer">
        <Button variant="outline" block onClick={() => onSelectJob(job)}>
          {isApplied ? 'View application details' : 'Details & Apply'}
        </Button>
      </div>
    </article>
  );
}
