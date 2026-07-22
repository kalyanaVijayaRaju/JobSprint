import { useState } from 'react';
import { User, Briefcase, GraduationCap, Link2, Save, CircleAlert } from 'lucide-react';

import CompletenessBar from './CompletenessBar.jsx';
import GeneralInfoForm from './GeneralInfoForm.jsx';
import ExperienceForm from './ExperienceForm.jsx';
import EducationForm from './EducationForm.jsx';
import PortfolioForm from './PortfolioForm.jsx';
import ResumeUploader from './ResumeUploader.jsx';
import { Button, Tabs } from '../ui';

/**
 * Main ProfileSettings component — tabbed profile editing interface.
 */
export default function ProfileSettings({
  user,
  profile,
  loadingProfile,
  profileForm,
  setProfileForm,
  onSaveProfile,
  onResumeUpload,
  resumeUploadStatus,
  resumeUploadError,
}) {
  const [activeSubTab, setActiveSubTab] = useState('general'); // 'general' | 'experience' | 'education' | 'portfolio'
  const [isDirty, setIsDirty] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onSaveProfile();
    setIsDirty(false);
  };

  const handleChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp = { company: '', position: '', startDate: '', endDate: '', current: false, description: '' };
    setProfileForm((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), newExp],
    }));
    setIsDirty(true);
  };

  const handleUpdateExperience = (index, field, value) => {
    setProfileForm((prev) => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveExperience = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' };
    setProfileForm((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEdu],
    }));
    setIsDirty(true);
  };

  const handleUpdateEducation = (index, field, value) => {
    setProfileForm((prev) => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveEducation = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  // Portfolio Links handlers
  const handleUpdatePortfolio = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      portfolioLinks: {
        ...(prev.portfolioLinks || { github: '', linkedin: '', website: '' }),
        [field]: value,
      },
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

  const profileTabs = [
    { id: 'general', label: 'General Info', icon: <User size={16} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
    { id: 'portfolio', label: 'Portfolio & Resume', icon: <Link2 size={16} /> },
  ];

  return (
    <div className="tab-content">
      <div className="profile-container-grid-layout">
        {/* Navigation Tabs */}
        {user.role === 'candidate' && (
          <Tabs
            tabs={profileTabs}
            activeTab={activeSubTab}
            onChange={setActiveSubTab}
            className="profile-tabs-nav"
          />
        )}

        <form onSubmit={handleProfileSubmit} className="profile-settings-form">
          <div className="profile-container-grid">
            <div className="profile-card">
              <CompletenessBar completeness={completeness} />

              <Tabs.Panel id="general" activeTab={activeSubTab}>
                <GeneralInfoForm user={user} profileForm={profileForm} onChange={handleChange} />
              </Tabs.Panel>

              {user.role === 'candidate' && (
                <>
                  <Tabs.Panel id="experience" activeTab={activeSubTab}>
                    <ExperienceForm
                      experiences={profileForm.experience || []}
                      onAdd={handleAddExperience}
                      onUpdate={handleUpdateExperience}
                      onRemove={handleRemoveExperience}
                      formatDateValue={formatDateValue}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel id="education" activeTab={activeSubTab}>
                    <EducationForm
                      educations={profileForm.education || []}
                      onAdd={handleAddEducation}
                      onUpdate={handleUpdateEducation}
                      onRemove={handleRemoveEducation}
                      formatDateValue={formatDateValue}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel id="portfolio" activeTab={activeSubTab}>
                    <PortfolioForm
                      portfolioLinks={profileForm.portfolioLinks || {}}
                      onUpdatePortfolio={handleUpdatePortfolio}
                    />
                  </Tabs.Panel>
                </>
              )}

              {/* Form Save Button */}
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {isDirty && (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--color-warning)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CircleAlert size={14} /> You have unsaved changes
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loadingProfile}
                  icon={<Save size={16} />}
                >
                  {loadingProfile ? 'Saving Details...' : 'Save Profile Details'}
                </Button>
              </div>
            </div>

            {/* Resume Upload Card */}
            {user.role === 'candidate' &&
              (activeSubTab === 'portfolio' || activeSubTab === 'general') && (
                <ResumeUploader
                  resumeUrl={profile?.resumeUrl}
                  onResumeUpload={onResumeUpload}
                  resumeUploadStatus={resumeUploadStatus}
                  resumeUploadError={resumeUploadError}
                />
              )}
          </div>
        </form>
      </div>
    </div>
  );
}
