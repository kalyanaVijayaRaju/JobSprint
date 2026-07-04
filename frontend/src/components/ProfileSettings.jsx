import { FileText, Upload, CheckCircle2, CircleAlert, ExternalLink } from 'lucide-react';

export default function ProfileSettings({
  user,
  profile,
  loadingProfile,
  profileForm,
  setProfileForm,
  onSaveProfile,
  onResumeUpload,
  resumeUploadStatus,
  resumeUploadError
}) {
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onSaveProfile();
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onResumeUpload(file);
  };

  // Calculate profile completeness score
  let completeness = 0;
  if (profileForm.firstName) completeness += 20;
  if (profileForm.lastName) completeness += 20;
  if (profileForm.phone) completeness += 20;
  if (profileForm.summary) completeness += 20;
  
  if (user.role === 'candidate') {
    if (profile?.resumeUrl) completeness += 20;
  } else {
    if (profileForm.jobTitle || profileForm.companyId) completeness += 20;
  }

  return (
    <div className="tab-content">
      <div className="profile-container-grid">
        <form onSubmit={handleProfileSubmit} className="profile-card">
          <h2>General Information</h2>
          <div className="profile-strength-meter" style={{ marginBottom: '16px' }}>
            <div className="strength-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              <span>Profile Completeness</span>
              <span className="strength-percentage">{completeness}%</span>
            </div>
            <div className="strength-bar-bg" style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
              <div className="strength-bar-fill" style={{ width: `${completeness}%`, height: '100%', background: '#0f766e', transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="first-name">First Name</label>
              <input
                id="first-name"
                type="text"
                value={profileForm.firstName}
                onChange={e => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last-name">Last Name</label>
              <input
                id="last-name"
                type="text"
                value={profileForm.lastName}
                onChange={e => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="text"
              placeholder="+1234567890"
              value={profileForm.phone}
              onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="summary">Professional Summary</label>
            <textarea
              id="summary"
              rows={4}
              placeholder="Short description of your background and credentials..."
              value={profileForm.summary}
              onChange={e => setProfileForm(prev => ({ ...prev, summary: e.target.value }))}
            />
          </div>

          {user.role === 'candidate' ? (
            <div className="form-group">
              <label htmlFor="skills">Professional Skills (comma-separated)</label>
              <input
                id="skills"
                type="text"
                placeholder="React, CSS, Node.js, JavaScript"
                value={profileForm.skills}
                onChange={e => setProfileForm(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>
          ) : (
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="job-title">Job Title</label>
                <input
                  id="job-title"
                  type="text"
                  placeholder="e.g. Hiring Manager"
                  value={profileForm.jobTitle}
                  onChange={e => setProfileForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="company-select">Associated Company ID</label>
                <input
                  id="company-select"
                  type="text"
                  placeholder="Paste verified Company ID"
                  value={profileForm.companyId}
                  onChange={e => setProfileForm(prev => ({ ...prev, companyId: e.target.value }))}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loadingProfile}>
            {loadingProfile ? 'Saving profile...' : 'Save Profile Details'}
          </button>
        </form>

        {user.role === 'candidate' && (
          <div className="profile-card resume-upload-card">
            <h2>Resume Attachment</h2>
            <p className="card-description">
              Upload your resume in PDF format (maximum size 5MB). This resume is snapshotted and attached to all future applications.
            </p>

            <div className="resume-uploader-area">
              <Upload size={36} className="upload-icon" />
              <div>
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf"
                  onChange={handleResumeFileChange}
                  className="hidden-file-input"
                />
                <label htmlFor="resume-file" className="btn btn-outline upload-file-btn">
                  Choose PDF Resume
                </label>
              </div>
              {resumeUploadStatus === 'uploading' && (
                <div className="upload-loader">
                  <div className="loader-spinner"></div>
                  <p>Uploading PDF file...</p>
                </div>
              )}
              {resumeUploadStatus === 'success' && (
                <p className="success-text">
                  <CheckCircle2 size={16} /> File uploaded successfully!
                </p>
              )}
              {resumeUploadStatus === 'error' && (
                <p className="error-text">
                  <CircleAlert size={16} /> {resumeUploadError}
                </p>
              )}
            </div>

            {profile?.resumeUrl && (
              <div className="current-resume-card">
                <div className="meta-item">
                  <FileText size={20} />
                  <div>
                    <strong>Active resume file on S3/Local:</strong>
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="resume-link">
                      View uploaded resume <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
