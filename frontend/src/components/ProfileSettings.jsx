import { useState } from 'react';
import { FileText, Upload, CheckCircle2, CircleAlert, ExternalLink, Briefcase, GraduationCap, Link2, User, Save, Trash2, Plus } from 'lucide-react';

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
  const [activeSubTab, setActiveSubTab] = useState('general'); // 'general' | 'experience' | 'education' | 'portfolio'
  const [isDirty, setIsDirty] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onSaveProfile();
    setIsDirty(false);
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onResumeUpload(file);
  };

  const handleChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp = { company: '', position: '', startDate: '', endDate: '', current: false, description: '' };
    setProfileForm(prev => ({
      ...prev,
      experience: [...(prev.experience || []), newExp]
    }));
    setIsDirty(true);
  };

  const handleUpdateExperience = (index, field, value) => {
    setProfileForm(prev => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveExperience = (index) => {
    setProfileForm(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' };
    setProfileForm(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }));
    setIsDirty(true);
  };

  const handleUpdateEducation = (index, field, value) => {
    setProfileForm(prev => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveEducation = (index) => {
    setProfileForm(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Portfolio Links handlers
  const handleUpdatePortfolio = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      portfolioLinks: {
        ...(prev.portfolioLinks || { github: '', linkedin: '', website: '' }),
        [field]: value
      }
    }));
    setIsDirty(true);
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

  // Format date helper for input type="date"
  const formatDateValue = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <div className="tab-content">
      <div className="profile-container-grid-layout">
        
        {/* Navigation Tabs Bar */}
        {user.role === 'candidate' && (
          <div className="profile-tabs-nav" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', paddingBottom: '2px' }}>
            <button
              type="button"
              className={`profile-tab-btn ${activeSubTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('general')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', color: activeSubTab === 'general' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeSubTab === 'general' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
            >
              <User size={16} /> General Info
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeSubTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('experience')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', color: activeSubTab === 'experience' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeSubTab === 'experience' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
            >
              <Briefcase size={16} /> Experience
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeSubTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('education')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', color: activeSubTab === 'education' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeSubTab === 'education' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
            >
              <GraduationCap size={16} /> Education
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeSubTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('portfolio')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', color: activeSubTab === 'portfolio' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeSubTab === 'portfolio' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
            >
              <Link2 size={16} /> Portfolio & Resume
            </button>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="profile-settings-form">
          <div className="profile-container-grid">
            
            {/* Form Section based on active tab */}
            <div className="profile-card">
              
              {/* Profile completeness bar */}
              <div className="profile-strength-meter" style={{ marginBottom: '24px' }}>
                <div className="strength-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Profile Completeness Meter 
                    {completeness === 100 && <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />}
                  </span>
                  <span className="strength-percentage">{completeness}%</span>
                </div>
                <div className="strength-bar-bg" style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className="strength-bar-fill" style={{ width: `${completeness}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease-out' }}></div>
                </div>
              </div>

              {activeSubTab === 'general' && (
                <div>
                  <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>General Information</h3>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="first-name">First Name</label>
                      <input
                        id="first-name"
                        type="text"
                        value={profileForm.firstName}
                        onChange={e => handleChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="last-name">Last Name</label>
                      <input
                        id="last-name"
                        type="text"
                        value={profileForm.lastName}
                        onChange={e => handleChange('lastName', e.target.value)}
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
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="summary">Professional Summary</label>
                    <textarea
                      id="summary"
                      rows={4}
                      placeholder="Short description of your background and credentials..."
                      value={profileForm.summary}
                      onChange={e => handleChange('summary', e.target.value)}
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
                        onChange={e => handleChange('skills', e.target.value)}
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
                          onChange={e => handleChange('jobTitle', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="company-select">Associated Company ID</label>
                        <input
                          id="company-select"
                          type="text"
                          placeholder="Paste verified Company ID"
                          value={profileForm.companyId}
                          onChange={e => handleChange('companyId', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'experience' && user.role === 'candidate' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontWeight: '700' }}>Work History</h3>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddExperience}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
                    >
                      <Plus size={14} /> Add Work Experience
                    </button>
                  </div>

                  {(!profileForm.experience || profileForm.experience.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                      <Briefcase size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No work history added yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {profileForm.experience.map((exp, index) => (
                        <div key={index} style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                            aria-label="Remove Experience"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="form-row-2" style={{ marginTop: '8px' }}>
                            <div className="form-group">
                              <label>Company</label>
                              <input
                                type="text"
                                placeholder="e.g. Google"
                                value={exp.company}
                                onChange={e => handleUpdateExperience(index, 'company', e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Position</label>
                              <input
                                type="text"
                                placeholder="e.g. Software Engineer"
                                value={exp.position}
                                onChange={e => handleUpdateExperience(index, 'position', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row-2">
                            <div className="form-group">
                              <label>Start Date</label>
                              <input
                                type="date"
                                value={formatDateValue(exp.startDate)}
                                onChange={e => handleUpdateExperience(index, 'startDate', e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>End Date</label>
                              <input
                                type="date"
                                value={formatDateValue(exp.endDate)}
                                onChange={e => handleUpdateExperience(index, 'endDate', e.target.value)}
                                disabled={exp.current}
                                required={!exp.current}
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              checked={exp.current || false}
                              onChange={e => handleUpdateExperience(index, 'current', e.target.checked)}
                            />
                            <label htmlFor={`current-${index}`} style={{ margin: 0, cursor: 'pointer' }}>I currently work here</label>
                          </div>

                          <div className="form-group">
                            <label>Responsibilities & Achievements</label>
                            <textarea
                              rows={3}
                              placeholder="Describe your role and impact..."
                              value={exp.description || ''}
                              onChange={e => handleUpdateExperience(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'education' && user.role === 'candidate' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontWeight: '700' }}>Education History</h3>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddEducation}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
                    >
                      <Plus size={14} /> Add Education
                    </button>
                  </div>

                  {(!profileForm.education || profileForm.education.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                      <GraduationCap size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No education history added yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {profileForm.education.map((edu, index) => (
                        <div key={index} style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(index)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                            aria-label="Remove Education"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="form-group" style={{ marginTop: '8px' }}>
                            <label>Institution</label>
                            <input
                              type="text"
                              placeholder="e.g. Stanford University"
                              value={edu.institution}
                              onChange={e => handleUpdateEducation(index, 'institution', e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-row-2">
                            <div className="form-group">
                              <label>Degree</label>
                              <input
                                type="text"
                                placeholder="e.g. Bachelor of Science"
                                value={edu.degree}
                                onChange={e => handleUpdateEducation(index, 'degree', e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Field of Study</label>
                              <input
                                type="text"
                                placeholder="e.g. Computer Science"
                                value={edu.fieldOfStudy}
                                onChange={e => handleUpdateEducation(index, 'fieldOfStudy', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row-2">
                            <div className="form-group">
                              <label>Start Date</label>
                              <input
                                type="date"
                                value={formatDateValue(edu.startDate)}
                                onChange={e => handleUpdateEducation(index, 'startDate', e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>End Date (or Expected)</label>
                              <input
                                type="date"
                                value={formatDateValue(edu.endDate)}
                                onChange={e => handleUpdateEducation(index, 'endDate', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'portfolio' && user.role === 'candidate' && (
                <div>
                  <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Portfolio & Social Links</h3>
                  
                  <div className="form-group">
                    <label htmlFor="github-link">GitHub URL</label>
                    <input
                      id="github-link"
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileForm.portfolioLinks?.github || ''}
                      onChange={e => handleUpdatePortfolio('github', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="linkedin-link">LinkedIn Profile URL</label>
                    <input
                      id="linkedin-link"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={profileForm.portfolioLinks?.linkedin || ''}
                      onChange={e => handleUpdatePortfolio('linkedin', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website-link">Personal Website URL</label>
                    <input
                      id="website-link"
                      type="url"
                      placeholder="https://example.com"
                      value={profileForm.portfolioLinks?.website || ''}
                      onChange={e => handleUpdatePortfolio('website', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Form Save Button & Dirty warning */}
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  {isDirty && (
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CircleAlert size={14} /> You have unsaved changes
                    </span>
                  )}
                </div>
                <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} />
                  {loadingProfile ? 'Saving Details...' : 'Save Profile Details'}
                </button>
              </div>
            </div>

            {/* Right Card - Resume attachment (Only shown on Portfolio or general tab) */}
            {user.role === 'candidate' && (activeSubTab === 'portfolio' || activeSubTab === 'general') && (
              <div className="profile-card resume-upload-card">
                <h2>Resume Attachment</h2>
                <p className="card-description" style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
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
                    <p className="success-text" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                      <CheckCircle2 size={16} /> File uploaded successfully!
                    </p>
                  )}
                  {resumeUploadStatus === 'error' && (
                    <p className="error-text" style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                      <CircleAlert size={16} /> {resumeUploadError}
                    </p>
                  )}
                </div>

                {profile?.resumeUrl && (
                  <div className="current-resume-card" style={{ marginTop: '20px', padding: '16px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <div className="meta-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block' }}>Active resume file:</strong>
                        <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="resume-link" style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: '600' }}>
                          View uploaded resume <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
