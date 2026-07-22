import { Bookmark, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { Badge, Button } from '../ui';

/**
 * Single job card item displaying metadata, skill match score, bookmark action, and details CTA.
 */
export default function JobCard({
  job,
  matchingSkills = [],
  matchScore = 0,
  isBookmarked = false,
  isApplied = false,
  hasProfileSkills = false,
  onToggleSave,
  onViewDetails,
}) {
  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <h3>{job.title}</h3>
          <p className="job-company">{job.companyId?.name || 'Company Details'}</p>
        </div>
        <button
          type="button"
          className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={() => onToggleSave(job._id)}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
        >
          <Bookmark size={18} />
        </button>
      </div>

      {hasProfileSkills && (
        <div
          className={`match-score ${matchScore >= 60 ? 'strong' : ''}`}
          title={`${matchingSkills.length} matching skills`}
        >
          <Sparkles size={14} aria-hidden="true" />
          <span>{matchScore}% skill match</span>
        </div>
      )}

      <div className="job-tags">
        <Badge variant="job-type">{job.jobType}</Badge>
        <Badge variant="location">{job.locationType}</Badge>
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
          <span
            key={skill}
            className={`skill-tag ${matchingSkills.includes(skill) ? 'skill-match' : ''}`}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="job-card-footer">
        <Button variant="outline" block onClick={() => onViewDetails(job._id)}>
          {isApplied ? 'View application details' : 'Details & Apply'}
        </Button>
      </div>
    </article>
  );
}
