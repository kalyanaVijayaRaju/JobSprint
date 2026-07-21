import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, Building2, CheckCircle2, CircleAlert, Clock, DollarSign, FileText, MapPin } from 'lucide-react';
import { applicationsApi, jobsApi, profileApi, savedJobsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

const formatSalary = (salaryRange) => {
  if (!salaryRange?.min && !salaryRange?.max) return 'Salary not specified';
  const currency = salaryRange.currency || 'USD';
  return `${salaryRange.min?.toLocaleString() || '—'} – ${salaryRange.max?.toLocaleString() || '—'} ${currency}`;
};

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const returnPath = `${location.pathname}${location.search}`;
  const isCandidate = user?.role === 'candidate';
  const isOwner = user?.role === 'recruiter' && (job?.recruiterId === user.id || job?.recruiterId?._id === user.id);
  const isOpen = job?.status === 'active' && new Date(job.expiresAt) > new Date();

  const loadCandidateState = useCallback(async () => {
    if (!isCandidate) return;
    const [profileResult, savedResult, applicationsResult] = await Promise.allSettled([
      profileApi.get(),
      savedJobsApi.list({ limit: 100 }),
      applicationsApi.myApplications({ limit: 100 })
    ]);

    if (profileResult.status === 'fulfilled' && profileResult.value.success) setProfile(profileResult.value.data.profile);
    if (savedResult.status === 'fulfilled' && savedResult.value.success) {
      setSaved(savedResult.value.data.savedJobs.some((entry) => (entry.jobId?._id || entry.jobId) === jobId));
    }
    if (applicationsResult.status === 'fulfilled' && applicationsResult.value.success) {
      setApplied(applicationsResult.value.data.applications.some((entry) => (entry.jobId?._id || entry.jobId) === jobId));
    }
  }, [isCandidate, jobId]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    jobsApi.get(jobId)
      .then((res) => { if (res.success) setJob(res.data.job); })
      .catch((err) => setError(err.status === 404 ? 'This job posting no longer exists.' : err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => { loadCandidateState(); }, [loadCandidateState]);

  const requireCandidate = () => {
    if (!user) {
      navigate('/login', { state: { from: returnPath } });
      return false;
    }
    if (!isCandidate) {
      triggerAlert('Only candidate accounts can save or apply for jobs.', 'error');
      return false;
    }
    return true;
  };

  const toggleSaved = async () => {
    if (!requireCandidate()) return;
    try {
      if (saved) {
        await savedJobsApi.unsave(jobId);
        setSaved(false);
        triggerAlert('Job removed from bookmarks');
      } else {
        await savedJobsApi.save(jobId);
        setSaved(true);
        triggerAlert('Job bookmarked successfully');
      }
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!requireCandidate() || applied) return;
    if (!profile?.resumeUrl) {
      triggerAlert('Upload a resume before applying.', 'error');
      navigate('/profile', { state: { from: returnPath } });
      return;
    }
    setSubmitting(true);
    try {
      await applicationsApi.apply(jobId, { coverLetter });
      setApplied(true);
      triggerAlert('Application submitted successfully');
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="job-details-page"><div className="jobs-loader"><div className="loader-spinner" /></div></main>;
  if (error || !job) return <main className="job-details-page"><div className="empty-state"><CircleAlert size={40} /><p>{error || 'Job not found.'}</p><Link className="btn btn-primary" to="/jobs">Browse open roles</Link></div></main>;

  return (
    <main className="job-details-page">
      <div className="job-details-shell">
        <Link className="back-link" to="/jobs">← Back to job search</Link>
        <header className="job-details-hero">
          <div className="job-details-title">
            <span className="eyebrow">{job.jobType} · {job.locationType}</span>
            <h1>{job.title}</h1>
            <p><Building2 size={18} /> {job.companyId?.name || 'Company details'} <span>·</span> <MapPin size={18} /> {job.location}</p>
          </div>
          <div className="job-details-actions">
            <button type="button" className={`bookmark-btn ${saved ? 'active' : ''}`} onClick={toggleSaved} aria-label={saved ? 'Remove bookmark' : 'Save job'}>
              <Bookmark size={20} /> {saved ? 'Saved' : 'Save job'}
            </button>
            {isOwner && <Link className="btn btn-outline" to="/jobs">Manage posting</Link>}
            {isOwner && <Link className="btn btn-primary" to="/applications">View applicants</Link>}
          </div>
        </header>

        <div className="job-details-layout">
          <article className="job-details-content">
            <section><h2>About this role</h2><p className="job-description">{job.description}</p></section>
            {job.requirements?.length > 0 && <section><h2>Requirements</h2><ul>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            <section><h2>Skills</h2><div className="job-skills">{job.skillsRequired?.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div></section>
          </article>

          <aside className="job-details-sidebar">
            <section className="job-facts-card">
              <h2>Role overview</h2>
              <p><MapPin size={17} /><span><strong>Location</strong>{job.location}</span></p>
              <p><BriefcaseBusiness size={17} /><span><strong>Employment</strong>{job.jobType}</span></p>
              <p><DollarSign size={17} /><span><strong>Salary</strong>{formatSalary(job.salaryRange)}</span></p>
              <p><Clock size={17} /><span><strong>Closes</strong>{new Date(job.expiresAt).toLocaleDateString()}</span></p>
            </section>
            {job.companyId && <section className="company-summary-card"><h2>{job.companyId.name}</h2><p>{job.companyId.industry}</p>{job.companyId.description && <p>{job.companyId.description}</p>}<Link to={`/jobs?companyId=${job.companyId._id}`}>Browse this company’s jobs</Link></section>}
            <section className="application-card">
              {!isOpen ? <p className="closed-job-notice">This posting is no longer accepting applications.</p> : applied ? <div className="already-applied-notice"><CheckCircle2 size={18} /> Application submitted. <Link to="/applications">Track progress</Link></div> : !user ? <><h2>Interested in this role?</h2><button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/login', { state: { from: returnPath } })}>Sign in to apply</button></> : !isCandidate ? <p className="closed-job-notice">Candidate accounts can apply for this role.</p> : profile?.resumeUrl ? <form onSubmit={submitApplication}><h2>Apply for this role</h2><label htmlFor="job-detail-cover-letter">Cover letter <span>(optional)</span></label><textarea id="job-detail-cover-letter" rows="5" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Tell the employer why you’re a great fit." /><button type="submit" className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</button></form> : <><h2>Ready to apply?</h2><p>Upload your resume to submit an application.</p><button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/profile', { state: { from: returnPath } })}><FileText size={16} /> Upload resume</button></>}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
