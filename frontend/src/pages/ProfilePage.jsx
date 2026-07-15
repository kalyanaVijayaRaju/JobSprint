import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { profileApi } from '../../api/client.js';
import ProfileSettings from '../../components/ProfileSettings.jsx';
import ChangePassword from '../../components/ChangePassword.jsx';
import SecurityActivity from '../../components/SecurityActivity.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const { profile, setProfile } = useOutletContext();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    summary: profile?.summary || '',
    skills: profile?.skills ? profile.skills.join(', ') : '',
    companyId: profile?.companyId?._id || profile?.companyId || '',
    jobTitle: profile?.jobTitle || '',
    experience: profile?.experience || [],
    education: profile?.education || [],
    portfolioLinks: profile?.portfolioLinks || { github: '', linkedin: '', website: '' }
  });
  const [resumeUploadStatus, setResumeUploadStatus] = useState(null);
  const [resumeUploadError, setResumeUploadError] = useState(null);

  // Sync form when profile loads
  useState(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        summary: profile.summary || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        companyId: profile.companyId?._id || profile.companyId || '',
        jobTitle: profile.jobTitle || '',
        experience: profile.experience || [],
        education: profile.education || [],
        portfolioLinks: profile.portfolioLinks || { github: '', linkedin: '', website: '' }
      });
    }
  });

  const fetchProfile = useCallback(() => {
    setLoadingProfile(true);
    profileApi.get()
      .then((res) => {
        if (res.success && res.data.profile) {
          setProfile(res.data.profile);
          setProfileForm({
            firstName: res.data.profile.firstName || '',
            lastName: res.data.profile.lastName || '',
            phone: res.data.profile.phone || '',
            summary: res.data.profile.summary || '',
            skills: res.data.profile.skills ? res.data.profile.skills.join(', ') : '',
            companyId: res.data.profile.companyId?._id || res.data.profile.companyId || '',
            jobTitle: res.data.profile.jobTitle || '',
            experience: res.data.profile.experience || [],
            education: res.data.profile.education || [],
            portfolioLinks: res.data.profile.portfolioLinks || { github: '', linkedin: '', website: '' }
          });
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [setProfile]);

  const handleProfileSave = async () => {
    setLoadingProfile(true);
    try {
      const data = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone || undefined,
        summary: profileForm.summary || undefined,
        experience: profileForm.experience,
        education: profileForm.education,
        portfolioLinks: profileForm.portfolioLinks
      };

      if (user.role === 'candidate') {
        data.skills = profileForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        data.companyId = profileForm.companyId || undefined;
        data.jobTitle = profileForm.jobTitle || undefined;
      }

      await profileApi.update(data);
      triggerAlert('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setResumeUploadStatus('error');
      setResumeUploadError('Only PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadStatus('error');
      setResumeUploadError('File exceeds 5MB size limit');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    setResumeUploadStatus('uploading');
    setResumeUploadError(null);
    try {
      await profileApi.uploadResume(formData);
      triggerAlert('Resume PDF uploaded and saved!');
      setResumeUploadStatus('success');
      fetchProfile();
    } catch (err) {
      setResumeUploadStatus('error');
      setResumeUploadError(err.message || 'File upload failed');
    }
  };

  return (
    <div className="profile-tab-wrapper">
      <ProfileSettings
        user={user}
        profile={profile}
        loadingProfile={loadingProfile}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        onSaveProfile={handleProfileSave}
        onResumeUpload={handleResumeUpload}
        resumeUploadStatus={resumeUploadStatus}
        resumeUploadError={resumeUploadError}
      />
      <div className="profile-security-grid" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <ChangePassword onSuccess={(msg) => triggerAlert(msg, 'success')} />
        <SecurityActivity />
      </div>
    </div>
  );
}
