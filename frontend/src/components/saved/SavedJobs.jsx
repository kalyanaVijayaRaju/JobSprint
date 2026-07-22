import { useState } from 'react';
import { BriefcaseBusiness, Search, SlidersHorizontal } from 'lucide-react';
import SavedJobCard from './SavedJobCard.jsx';
import JobDetailDrawer from '../jobs/JobDetailDrawer.jsx';
import { Button, Spinner, EmptyState, Pagination } from '../ui';

/**
 * SavedJobs component — list of bookmarked jobs with search, filtering, and detail drawer.
 */
export default function SavedJobs({
  user,
  profile,
  savedJobs = [],
  myApps = [],
  onToggleSaveJob,
  onApply,
  submittingApplication,
  setActiveTab,
  loadingSavedJobs,
  search,
  setSearch,
  locationType,
  setLocationType,
  jobType,
  setJobType,
  status,
  setStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  page,
  setPage,
  pagination,
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    onApply(selectedJob._id, coverLetter, () => {
      setSelectedJob(null);
      setCoverLetter('');
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocationType('');
    setJobType('');
    setStatus('active');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || locationType || jobType || status !== 'active');

  return (
    <div className="tab-content">
      {/* Header & Filter Controls */}
      <div
        className="section-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h2>Bookmarked Roles</h2>
        <Button
          variant="outline"
          className="mobile-filter-toggle"
          icon={<SlidersHorizontal size={16} />}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          Filters
        </Button>
      </div>

      {/* Filter toolbar */}
      <div
        className={`saved-jobs-filters ${showMobileFilters ? 'open' : ''}`}
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search bookmarked roles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={jobType}
          onChange={(e) => {
            setJobType(e.target.value);
            setPage(1);
          }}
          style={{ width: '140px' }}
        >
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>

        <select
          value={locationType}
          onChange={(e) => {
            setLocationType(e.target.value);
            setPage(1);
          }}
          style={{ width: '140px' }}
        >
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          style={{ width: '130px' }}
        >
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
          <option value="all">All Statuses</option>
        </select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        )}
      </div>

      {/* Grid */}
      {loadingSavedJobs ? (
        <Spinner size="lg" label="Loading saved jobs..." />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness size={40} />}
          title="No bookmarked jobs"
          description={
            hasActiveFilters
              ? 'No saved jobs match your selected filters.'
              : "You haven't bookmarked any jobs yet."
          }
          action={
            <Button variant="primary" onClick={() => setActiveTab('jobs')}>
              Browse Jobs
            </Button>
          }
        />
      ) : (
        <>
          <div className="jobs-grid">
            {savedJobs.map((saved) => {
              const job = saved.jobId || saved;
              const isApplied = myApps.some((app) => (app.jobId?._id || app.jobId) === job._id);

              return (
                <SavedJobCard
                  key={saved._id || job._id}
                  savedItem={saved}
                  isApplied={isApplied}
                  onUnsave={onToggleSaveJob}
                  onSelectJob={setSelectedJob}
                />
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalSavedJobs}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Slide-in Detail Drawer */}
      <JobDetailDrawer
        selectedJob={selectedJob}
        onClose={() => setSelectedJob(null)}
        isApplied={myApps.some((app) => (app.jobId?._id || app.jobId) === selectedJob?._id)}
        profile={profile}
        coverLetter={coverLetter}
        setCoverLetter={setCoverLetter}
        onApplySubmit={handleApplySubmit}
        submittingApplication={submittingApplication}
        onNavigateToProfile={() => {
          setActiveTab('profile');
          setSelectedJob(null);
        }}
      />
    </div>
  );
}
