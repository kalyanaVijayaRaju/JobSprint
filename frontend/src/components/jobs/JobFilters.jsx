import { Search, X } from 'lucide-react';
import { Button } from '../ui';

/**
 * Filter pane sidebar for candidate job discovery.
 */
export default function JobFilters({
  isOpen,
  onClose,
  jobSearch,
  setJobSearch,
  jobTypeFilter,
  setJobTypeFilter,
  locationTypeFilter,
  setLocationTypeFilter,
  experienceFilter,
  setExperienceFilter,
  salaryMinFilter,
  setSalaryMinFilter,
  salaryMaxFilter,
  setSalaryMaxFilter,
  onSubmit,
  onClear,
  hasActiveFilters,
}) {
  return (
    <aside className={`filter-pane ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="filter-pane-header">
        <h3>Filters</h3>
        <button
          type="button"
          className="close-filters-btn"
          onClick={onClose}
          aria-label="Close filters"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="filter-form">
        <div className="form-group">
          <label htmlFor="search-keyword">Search Keyword</label>
          <div className="search-input">
            <Search size={16} />
            <input
              id="search-keyword"
              type="text"
              placeholder="Title, description or skills..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="job-type-select">Job Type</label>
          <select
            id="job-type-select"
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location-type-select">Location Type</label>
          <select
            id="location-type-select"
            value={locationTypeFilter}
            onChange={(e) => setLocationTypeFilter(e.target.value)}
          >
            <option value="">All Location Types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="experience-level-select">Experience Level</label>
          <select
            id="experience-level-select"
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
          >
            <option value="">All Experience Levels</option>
            <option value="entry">Entry Level / Junior</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive / VP</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="min-salary-input">Min Salary (Annual USD)</label>
          <input
            id="min-salary-input"
            type="number"
            placeholder="e.g. 50000"
            value={salaryMinFilter}
            onChange={(e) => setSalaryMinFilter(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="max-salary-input">Max Salary (Annual USD)</label>
          <input
            id="max-salary-input"
            type="number"
            placeholder="e.g. 150000"
            value={salaryMaxFilter}
            onChange={(e) => setSalaryMaxFilter(e.target.value)}
          />
        </div>

        <div className="filter-actions-row">
          <Button type="submit" variant="primary" block>
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="outline" block onClick={onClear}>
              Clear Filters
            </Button>
          )}
        </div>
      </form>
    </aside>
  );
}
