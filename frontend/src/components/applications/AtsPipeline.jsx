import { useState } from 'react';
import { UsersRound } from 'lucide-react';
import KanbanBoard from './KanbanBoard.jsx';
import ApplicantDetail from './ApplicantDetail.jsx';
import CandidateTimeline from './CandidateTimeline.jsx';

/**
 * Main AtsPipeline component — orchestrates recruiter applicant Kanban board and candidate application tracking timeline.
 */
export default function AtsPipeline({
  user,
  selectedJobForApplicants,
  setSelectedJobForApplicants,
  recruiterJobs = [],
  selectedJobApplicants = [],
  loadingApplicants = false,
  onUpdateStatus,
  onAddNote,
  submittingNote,
  fetchJobApplicants,
  myApps = [],
  loadingMyApps = false,
  setActiveTab,
  onWithdraw,
  withdrawingApplicationId,
}) {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [recruiterNote, setRecruiterNote] = useState('');

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!recruiterNote.trim()) return;
    onAddNote(selectedApplication._id, recruiterNote, (updatedApp) => {
      setRecruiterNote('');
      setSelectedApplication(updatedApp);
    });
  };

  const handleStatusChange = async (appId, newStatus) => {
    await onUpdateStatus(appId, newStatus);
    if (selectedApplication && selectedApplication._id === appId) {
      setSelectedApplication((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Recruiter pipeline view
  if (user.role === 'recruiter') {
    return (
      <div className="tab-content">
        <div className="recruiter-ats-view">
          <div
            className="ats-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <h2>
              Pipeline Board:{' '}
              <select
                value={selectedJobForApplicants?._id || ''}
                onChange={(e) => {
                  const targetJob = recruiterJobs.find((j) => j._id === e.target.value);
                  setSelectedJobForApplicants(targetJob);
                  setSelectedApplication(null);
                  if (targetJob) fetchJobApplicants(targetJob._id);
                }}
              >
                <option value="">-- Choose Job Posting --</option>
                {recruiterJobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </h2>
          </div>

          {!selectedJobForApplicants ? (
            <div className="empty-state">
              <UsersRound size={40} />
              <p>Select a job posting above to manage applicant pipelines.</p>
            </div>
          ) : (
            <KanbanBoard
              applicants={selectedJobApplicants}
              onUpdateStatus={handleStatusChange}
              onSelectApplication={setSelectedApplication}
              selectedApplication={selectedApplication}
            />
          )}

          <ApplicantDetail
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdateStatus={handleStatusChange}
            recruiterNote={recruiterNote}
            setRecruiterNote={setRecruiterNote}
            onAddNoteSubmit={handleNoteSubmit}
            submittingNote={submittingNote}
          />
        </div>
      </div>
    );
  }

  // Candidate applications view
  return (
    <div className="tab-content">
      <h2 style={{ marginBottom: '24px', fontWeight: '800' }}>My Job Applications</h2>
      <CandidateTimeline
        myApps={myApps}
        loading={loadingMyApps}
        onWithdraw={onWithdraw}
        withdrawingApplicationId={withdrawingApplicationId}
        onBrowseJobs={() => setActiveTab('jobs')}
      />
    </div>
  );
}
