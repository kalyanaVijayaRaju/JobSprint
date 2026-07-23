import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, ArrowUpDown } from 'lucide-react';

import SkillMatchBanner from './SkillMatchBanner.jsx';
import JobCard from './JobCard.jsx';
import JobFilters from './JobFilters.jsx';
import JobDetailDrawer from './JobDetailDrawer.jsx';
import RecruiterJobsTable from './RecruiterJobsTable.jsx';
import { Spinner, EmptyState, Pagination } from '../ui';

/**
 * Main JobsBoard component — orchestrates candidate job discovery and recruiter job management views.
 */
export default function JobsBoard({
  user,
  profile,
  jobs = [],
  myApps = [],
  loadingJobs = false,
  savedJobs = [],
  recruiterJobs = [],
  onSearch,
  onToggleSaveJob,
  onApply,
  onPostJob,
  onUpdateJob,
  onDeleteJob,
  onCloseJob,
  onReopenJob,
  submittingApplication,
  submittingJob,
  setActiveTab,
  setSelectedJobForApplicants,
  fetchJobApplicants,
  pagination,
  queryFilters,
}) {
  const navigate = useNavigate();

  // Filter state
  const [jobSearch, setJobSearch] = useState(queryFilters?.search || '');
  const [jobTypeFilter, setJobTypeFilter] = useState(queryFilters?.jobType || '');
  const [locationTypeFilter, setLocationTypeFilter] = useState(queryFilters?.locationType || '');
  const [salaryMinFilter, setSalaryMinFilter] = useState(queryFilters?.salaryMin || '');
  const [salaryMaxFilter, setSalaryMaxFilter] = useState(queryFilters?.salaryMax || '');
  const [experienceFilter, setExperienceFilter] = useState(queryFilters?.experience || '');
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(true);
  const [sortBy, setSortBy] = useState(queryFilters?.sort || 'match');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showCreateJob, setShowCreateJob] = useState(false);

  // Sync state with query filters
  useEffect(() => {
    setJobSearch(queryFilters?.search || '');
    setJobTypeFilter(queryFilters?.jobType || '');
    setLocationTypeFilter(queryFilters?.locationType || '');
    setSalaryMinFilter(queryFilters?.salaryMin || '');
    setSalaryMaxFilter(queryFilters?.salaryMax || '');
    setExperienceFilter(queryFilters?.experience || '');
    setSortBy(queryFilters?.sort || 'match');
  }, [queryFilters]);

  // Handle filter submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch({
      search: jobSearch || undefined,
      jobType: jobTypeFilter || undefined,
      locationType: locationTypeFilter || undefined,
      salaryMin: salaryMinFilter ? Number(salaryMinFilter) : undefined,
      salaryMax: salaryMaxFilter ? Number(salaryMaxFilter) : undefined,
      experience: experienceFilter || undefined,
      sort: sortBy,
      page: 1,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setJobSearch('');
    setJobTypeFilter('');
    setLocationTypeFilter('');
    setSalaryMinFilter('');
    setSalaryMaxFilter('');
    setExperienceFilter('');
    onSearch({ page: 1 });
  };

  const hasActiveFilters = Boolean(
    jobSearch || jobTypeFilter || locationTypeFilter || salaryMinFilter || salaryMaxFilter || experienceFilter
  );

  // Candidate skills matching logic
  const candidateSkills = useMemo(
    () => (profile?.skills || []).map((skill) => skill.trim().toLowerCase()).filter(Boolean),
    [profile?.skills]
  );

  const rankedJobs = useMemo(() => {
    let withMatchData = jobs.map((job) => {
      const requiredSkills = job.skillsRequired || [];
      const matchingSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill.toLowerCase()));
      const matchScore = requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 0;

      return { job, matchingSkills, matchScore };
    });

    if (experienceFilter) {
      withMatchData = withMatchData.filter(({ job }) => {
        const textToSearch = `${job.title} ${job.description} ${job.requirements?.join(' ') || ''}`.toLowerCase();
        if (experienceFilter === 'entry') {
          return textToSearch.includes('entry') || textToSearch.includes('junior') || textToSearch.includes('intern') || textToSearch.includes('associate');
        }
        if (experienceFilter === 'mid') {
          return textToSearch.includes('mid') || textToSearch.includes('intermediate') || textToSearch.includes('3+') || textToSearch.includes('4+');
        }
        if (experienceFilter === 'senior') {
          return textToSearch.includes('senior') || textToSearch.includes('lead') || textToSearch.includes('5+') || textToSearch.includes('8+');
        }
        if (experienceFilter === 'executive') {
          return textToSearch.includes('executive') || textToSearch.includes('director') || textToSearch.includes('vp') || textToSearch.includes('head of') || textToSearch.includes('manager');
        }
        return true;
      });
    }

    return withMatchData.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.job.createdAt || 0) - new Date(a.job.createdAt || 0);
      if (sortBy === 'salary') return (b.job.salaryRange?.max || 0) - (a.job.salaryRange?.max || 0);
      return b.matchScore - a.matchScore;
    });
  }, [candidateSkills, jobs, sortBy, experienceFilter]);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    onApply(selectedJob._id, coverLetter, () => {
      setSelectedJob(null);
      setCoverLetter('');
    });
  };

  // Recruiter view
  if (user.role === 'recruiter') {
    return (
      <RecruiterJobsTable
        recruiterJobs={recruiterJobs}
        showCreateJob={showCreateJob}
        setShowCreateJob={setShowCreateJob}
        onPostJob={onPostJob}
        submittingJob={submittingJob}
        onManageAts={(job) => {
          setSelectedJobForApplicants(job);
          fetchJobApplicants(job._id);
          setActiveTab('applications');
        }}
        onUpdateJobStatus={(jobId, status) => onUpdateJob(jobId, { status })}
        onCloseJob={onCloseJob}
        onReopenJob={onReopenJob}
        onArchiveJob={(jobId) => {
          if (window.confirm('Are you sure you want to archive this job posting?')) {
            onDeleteJob(jobId);
          }
        }}
      />
    );
  }

  // Candidate view
  return (
    <div className="tab-content">
      <div className="candidate-jobs-layout">
        {/* Toggle filters button for mobile */}
        <button
          type="button"
          className="btn btn-outline toggle-filters-btn"
          onClick={() => setIsFilterPaneOpen(!isFilterPaneOpen)}
        >
          {isFilterPaneOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Collapsible sticky filter pane */}
        <JobFilters
          isOpen={isFilterPaneOpen}
          onClose={() => setIsFilterPaneOpen(false)}
          jobSearch={jobSearch}
          setJobSearch={setJobSearch}
          jobTypeFilter={jobTypeFilter}
          setJobTypeFilter={setJobTypeFilter}
          locationTypeFilter={locationTypeFilter}
          setLocationTypeFilter={setLocationTypeFilter}
          experienceFilter={experienceFilter}
          setExperienceFilter={setExperienceFilter}
          salaryMinFilter={salaryMinFilter}
          setSalaryMinFilter={setSalaryMinFilter}
          salaryMaxFilter={salaryMaxFilter}
          setSalaryMaxFilter={setSalaryMaxFilter}
          onSubmit={handleSearchSubmit}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Results area */}
        <div className="jobs-results-pane">
          {candidateSkills.length === 0 && (
            <SkillMatchBanner onUpdateProfile={() => setActiveTab('profile')} />
          )}

          <div className="results-header">
            <div className="results-summary" aria-live="polite">
              <span>
                {loadingJobs
                  ? 'Searching open roles…'
                  : `${pagination?.totalJobs || jobs.length} ${pagination?.totalJobs === 1 ? 'role' : 'roles'} found`}
              </span>
              {hasActiveFilters && !loadingJobs && <span> • Filtered results</span>}
            </div>

            <label className="sort-control">
              <ArrowUpDown size={14} aria-hidden="true" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  onSearch({
                    search: jobSearch || undefined,
                    companyId: queryFilters?.companyId || undefined,
                    jobType: jobTypeFilter || undefined,
                    locationType: locationTypeFilter || undefined,
                    salaryMin: salaryMinFilter || undefined,
                    salaryMax: salaryMaxFilter || undefined,
                    experience: experienceFilter || undefined,
                    sort: e.target.value,
                    page: 1,
                  })
                }
              >
                <option value="match">Best match</option>
                <option value="newest">Newest first</option>
                <option value="salary">Highest salary</option>
              </select>
            </label>
          </div>

          {/* Job grid */}
          {loadingJobs ? (
            <Spinner size="lg" label="Loading jobs..." />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness size={40} />}
              title="No jobs found"
              description="No job postings found matching your search."
            />
          ) : (
            <>
              <div className="jobs-grid">
                {rankedJobs.map(({ job, matchingSkills, matchScore }) => {
                  const isBookmarked = savedJobs.some((s) => (s.jobId?._id || s.jobId) === job._id);
                  const isApplied = myApps.some((app) => (app.jobId?._id || app.jobId) === job._id);
                  return (
                    <JobCard
                      key={job._id}
                      job={job}
                      matchingSkills={matchingSkills}
                      matchScore={matchScore}
                      isBookmarked={isBookmarked}
                      isApplied={isApplied}
                      hasProfileSkills={candidateSkills.length > 0}
                      onToggleSave={onToggleSaveJob}
                      onViewDetails={(jobId) => navigate(`/jobs/${jobId}`)}
                    />
                  );
                })}
              </div>

              {/* Pagination controls */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalJobs}
                  onPageChange={(page) =>
                    onSearch({
                      search: jobSearch || undefined,
                      jobType: jobTypeFilter || undefined,
                      locationType: locationTypeFilter || undefined,
                      salaryMin: salaryMinFilter ? Number(salaryMinFilter) : undefined,
                      salaryMax: salaryMaxFilter ? Number(salaryMaxFilter) : undefined,
                      experience: experienceFilter || undefined,
                      sort: sortBy,
                      page,
                    })
                  }
                />
              )}
            </>
          )}
        </div>
      </div>

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
