import { useState, useCallback, useEffect } from 'react';
import { profileApi } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

/**
 * Custom hook for profile data management and resume uploading.
 *
 * @param {object} options
 * @param {object} options.user - Current auth user
 */
export function useProfile({ user } = {}) {
  const { triggerAlert } = useApp();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [resumeUploadStatus, setResumeUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [resumeUploadError, setResumeUploadError] = useState(null);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    summary: '',
    skills: '',
    jobTitle: '',
    companyId: '',
    experience: [],
    education: [],
    portfolioLinks: { github: '', linkedin: '', website: '' },
  });

  const fetchProfile = useCallback(() => {
    if (!user) return;
    setLoadingProfile(true);
    profileApi.get()
      .then((res) => {
        if (res.success && res.data.profile) {
          const prof = res.data.profile;
          setProfile(prof);
          setProfileForm({
            firstName: prof.firstName || '',
            lastName: prof.lastName || '',
            phone: prof.phone || '',
            summary: prof.summary || '',
            skills: Array.isArray(prof.skills) ? prof.skills.join(', ') : prof.skills || '',
            jobTitle: prof.jobTitle || '',
            companyId: prof.companyId || '',
            experience: prof.experience || [],
            education: prof.education || [],
            portfolioLinks: prof.portfolioLinks || { github: '', linkedin: '', website: '' },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = useCallback(async (customFormData) => {
    const dataToSave = customFormData || {
      ...profileForm,
      skills: typeof profileForm.skills === 'string'
        ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : profileForm.skills,
    };

    setLoadingProfile(true);
    try {
      const res = await profileApi.update(dataToSave);
      if (res.success && res.data.profile) {
        setProfile(res.data.profile);
        triggerAlert('Profile saved successfully!');
      }
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoadingProfile(false);
    }
  }, [profileForm, triggerAlert]);

  const handleResumeUpload = useCallback(async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setResumeUploadStatus('error');
      setResumeUploadError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadStatus('error');
      setResumeUploadError('File size exceeds 5MB limit.');
      return;
    }

    setResumeUploadStatus('uploading');
    setResumeUploadError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await profileApi.uploadResume(formData);
      if (res.success && res.data.resumeUrl) {
        setProfile((prev) => (prev ? { ...prev, resumeUrl: res.data.resumeUrl } : prev));
        setResumeUploadStatus('success');
        triggerAlert('Resume uploaded successfully!');
        fetchProfile();
      }
    } catch (err) {
      setResumeUploadStatus('error');
      setResumeUploadError(err.message || 'Upload failed');
    }
  }, [fetchProfile, triggerAlert]);

  return {
    profile,
    profileForm,
    setProfileForm,
    loadingProfile,
    resumeUploadStatus,
    resumeUploadError,
    fetchProfile,
    handleSaveProfile,
    handleResumeUpload,
  };
}

export default useProfile;
