import { Search, X } from 'lucide-react';
import { Button } from '../ui';
import SearchAutocomplete from './SearchAutocomplete.jsx';
import SalaryRangeSlider from './SalaryRangeSlider.jsx';

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
          <SearchAutocomplete
            value={jobSearch}
            onChange={setJobSearch}
            placeholder="Title, skill, or keyword..."
          />
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
          <label>Salary Range (Annual USD)</label>
          <SalaryRangeSlider
            minSalary={salaryMinFilter}
            setMinSalary={setSalaryMinFilter}
            maxSalary={salaryMaxFilter}
            setMaxSalary={setSalaryMaxFilter}
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
