const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------

/**
 * Wrapper around fetch that:
 *  - Prepends the API base URL
 *  - Sends/receives JSON by default
 *  - Includes cookies (credentials: 'include') for JWT cookie auth
 *  - Throws a structured error when the response is not OK
 */
const apiFetch = async (path, options = {}) => {
  const { body, headers: extraHeaders, ...rest } = options;

  const headers = { ...extraHeaders };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || response.statusText);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
};

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export const getReadiness = async () => {
  const response = await fetch(`${API_BASE_URL}/health/ready`);
  const payload = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: payload.status || 'UNKNOWN',
    timestamp: payload.timestamp || null
  };
};

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  register: (data) => apiFetch('/api/v1/auth/register', { method: 'POST', body: data }),
  login: (data) => apiFetch('/api/v1/auth/login', { method: 'POST', body: data }),
  logout: () => apiFetch('/api/v1/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/api/v1/auth/me'),
  changePassword: (data) => apiFetch('/api/v1/auth/password', { method: 'PATCH', body: data }),
  forgotPassword: (email) => apiFetch('/api/v1/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => apiFetch(`/api/v1/auth/reset-password/${token}`, { method: 'POST', body: { password } }),
  verifyEmail: (token) => apiFetch(`/api/v1/auth/verify-email/${token}`),
  securityActivity: (params = {}) => {

    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/auth/security/activity${query ? `?${query}` : ''}`);
  }
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export const adminApi = {
  listUsers: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserStatus: (id, data) => apiFetch(`/api/v1/admin/users/${id}/status`, { method: 'PATCH', body: data }),
  auditLogs: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/admin/audit-logs${query ? `?${query}` : ''}`);
  }
};

// ---------------------------------------------------------------------------
// Companies API
// ---------------------------------------------------------------------------

export const companiesApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/companies${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/api/v1/companies/${id}`),
  getDetail: (id) => apiFetch(`/api/v1/companies/${id}/detail`),
  getJobs: (id, params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/companies/${id}/jobs${query ? `?${query}` : ''}`);
  },
  follow: (id) => apiFetch(`/api/v1/companies/${id}/follow`, { method: 'POST' }),
  unfollow: (id) => apiFetch(`/api/v1/companies/${id}/follow`, { method: 'DELETE' }),
  create: (data) => apiFetch('/api/v1/companies', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/v1/companies/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/api/v1/companies/${id}`, { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Jobs API
// ---------------------------------------------------------------------------

export const jobsApi = {
  /**
   * List jobs with optional filters.
   * @param {Object} params - Query parameters (page, limit, search, location, jobType, etc.)
   */
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();

    return apiFetch(`/api/v1/jobs${query ? `?${query}` : ''}`);
  },

  get: (id) => apiFetch(`/api/v1/jobs/${id}`),
  create: (data) => apiFetch('/api/v1/jobs', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/v1/jobs/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/api/v1/jobs/${id}`, { method: 'DELETE' }),
  close: (id) => apiFetch(`/api/v1/jobs/${id}/close`, { method: 'PATCH' }),
  reopen: (id, data) => apiFetch(`/api/v1/jobs/${id}/reopen`, { method: 'PATCH', body: data }),
  autocomplete: (q) => apiFetch(`/api/v1/jobs/search/autocomplete?q=${encodeURIComponent(q)}`)
};

// ---------------------------------------------------------------------------
// Profile API
// ---------------------------------------------------------------------------

export const profileApi = {
  get: () => apiFetch('/api/v1/users/profile'),
  update: (data) => apiFetch('/api/v1/users/profile', { method: 'PUT', body: data }),
  uploadResume: (formData) => apiFetch('/api/v1/users/resume/upload', { method: 'POST', body: formData })
};

// ---------------------------------------------------------------------------
// Applications API
// ---------------------------------------------------------------------------

export const applicationsApi = {
  apply: (jobId, data) => apiFetch(`/api/v1/applications/${jobId}/apply`, { method: 'POST', body: data }),
  myApplications: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/applications/my-applications${query ? `?${query}` : ''}`);
  },
  jobApplications: (jobId, params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/applications/job/${jobId}${query ? `?${query}` : ''}`);
  },
  updateStatus: (id, status) => apiFetch(`/api/v1/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  addNote: (id, note) => apiFetch(`/api/v1/applications/${id}/notes`, { method: 'POST', body: { note } }),
  summary: () => apiFetch('/api/v1/applications/summary'),
  withdraw: (id) => apiFetch(`/api/v1/applications/${id}/withdraw`, { method: 'PATCH' }),
  scheduleInterview: (id, data) => apiFetch(`/api/v1/applications/${id}/interviews`, { method: 'POST', body: data }),
  updateInterview: (id, interviewId, data) => apiFetch(`/api/v1/applications/${id}/interviews/${interviewId}`, { method: 'PATCH', body: data }),
  getInterviews: (id) => apiFetch(`/api/v1/applications/${id}/interviews`),
  respondToInterview: (id, interviewId, data) => apiFetch(`/api/v1/applications/${id}/interviews/${interviewId}/response`, { method: 'PATCH', body: data }),
  upcomingInterviews: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/applications/interviews/upcoming${query ? `?${query}` : ''}`);
  },
  bulkUpdateStatus: (applicationIds, status) => apiFetch('/api/v1/applications/bulk-status', {
    method: 'PATCH',
    body: { applicationIds, status }
  })
};

// ---------------------------------------------------------------------------
// Saved Jobs API
// ---------------------------------------------------------------------------

export const savedJobsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/saved-jobs${query ? `?${query}` : ''}`);
  },
  save: (jobId) => apiFetch(`/api/v1/saved-jobs/${jobId}`, { method: 'POST' }),
  unsave: (jobId) => apiFetch(`/api/v1/saved-jobs/${jobId}`, { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Notifications API
// ---------------------------------------------------------------------------

export const notificationsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/notifications${query ? `?${query}` : ''}`);
  },
  unreadCount: () => apiFetch('/api/v1/notifications/unread-count'),
  markRead: (id) => apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch('/api/v1/notifications/mark-all-read', { method: 'PATCH' }),
  delete: (id) => apiFetch(`/api/v1/notifications/${id}`, { method: 'DELETE' }),
  clearRead: () => apiFetch('/api/v1/notifications/read', { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Job Alerts API
// ---------------------------------------------------------------------------

export const jobAlertsApi = {
  list: () => apiFetch('/api/v1/job-alerts'),
  create: (data) => apiFetch('/api/v1/job-alerts', { method: 'POST', body: data }),
  delete: (id) => apiFetch(`/api/v1/job-alerts/${id}`, { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Analytics API
// ---------------------------------------------------------------------------

export const analyticsApi = {
  platform: () => apiFetch('/api/v1/analytics/platform'),
  recruiter: () => apiFetch('/api/v1/analytics/recruiter'),
  candidate: () => apiFetch('/api/v1/analytics/candidate'),
  trends: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/analytics/trends${query ? `?${query}` : ''}`);
  }
};

// ---------------------------------------------------------------------------
// Messages API
// ---------------------------------------------------------------------------

export const messagesApi = {
  conversations: () => apiFetch('/api/v1/messages/conversations'),
  unreadCount: () => apiFetch('/api/v1/messages/unread-count'),
  getThread: (partnerId, params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/messages/${partnerId}${query ? `?${query}` : ''}`);
  },
  send: (partnerId, content, applicationId) => apiFetch(`/api/v1/messages/${partnerId}`, {
    method: 'POST',
    body: { content, applicationId }
  }),
  markRead: (messageId) => apiFetch(`/api/v1/messages/${messageId}/read`, { method: 'PATCH' })
};

// ---------------------------------------------------------------------------
// Assessments API
// ---------------------------------------------------------------------------

export const assessmentsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/assessments${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/api/v1/assessments/${id}`),
  submit: (id, data) => apiFetch(`/api/v1/assessments/${id}/submit`, { method: 'POST', body: data }),
  myResults: () => apiFetch('/api/v1/assessments/my-results'),
  myBadges: () => apiFetch('/api/v1/assessments/my-badges'),
  seed: () => apiFetch('/api/v1/assessments/seed', { method: 'POST' })
};

// ---------------------------------------------------------------------------
// Settings API
// ---------------------------------------------------------------------------

export const settingsApi = {
  getPreferences: () => apiFetch('/api/v1/settings/preferences'),
  updatePreferences: (data) => apiFetch('/api/v1/settings/preferences', { method: 'PATCH', body: data })
};

// ---------------------------------------------------------------------------
// Email Templates API
// ---------------------------------------------------------------------------

export const emailTemplatesApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/email-templates${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/api/v1/email-templates/${id}`),
  create: (data) => apiFetch('/api/v1/email-templates', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/v1/email-templates/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/api/v1/email-templates/${id}`, { method: 'DELETE' }),
  render: (id, variables) => apiFetch(`/api/v1/email-templates/${id}/render`, { method: 'POST', body: { variables } })
};

// ---------------------------------------------------------------------------
// Talent Pool API
// ---------------------------------------------------------------------------

export const talentPoolApi = {
  search: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/talent-pool/search${query ? `?${query}` : ''}`);
  }
};

// ---------------------------------------------------------------------------
// Resumes / CV Builder API
// ---------------------------------------------------------------------------

export const resumesApi = {
  list: () => apiFetch('/api/v1/resumes'),
  get: (id) => apiFetch(`/api/v1/resumes/${id}`),
  create: (data) => apiFetch('/api/v1/resumes', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/v1/resumes/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/api/v1/resumes/${id}`, { method: 'DELETE' }),
  preview: (id) => apiFetch(`/api/v1/resumes/${id}/preview`),
  pdf: (id) => apiFetch(`/api/v1/resumes/${id}/pdf`)
};

// ---------------------------------------------------------------------------
// Interview Prep API
// ---------------------------------------------------------------------------

export const interviewPrepApi = {
  listQuestions: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/interview-prep/questions${query ? `?${query}` : ''}`);
  },
  getQuestion: (id) => apiFetch(`/api/v1/interview-prep/questions/${id}`),
  savePractice: (id, data) => apiFetch(`/api/v1/interview-prep/questions/${id}/practice`, { method: 'POST', body: data }),
  toggleFavorite: (id) => apiFetch(`/api/v1/interview-prep/questions/${id}/favorite`, { method: 'POST' }),
  getHistory: () => apiFetch('/api/v1/interview-prep/history'),
  getFavorites: () => apiFetch('/api/v1/interview-prep/favorites'),
  getStats: () => apiFetch('/api/v1/interview-prep/stats'),
  seed: () => apiFetch('/api/v1/interview-prep/seed', { method: 'POST' })
};

// ---------------------------------------------------------------------------
// Activity Feed API
// ---------------------------------------------------------------------------

export const activityFeedApi = {
  getPublic: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/feed/public${query ? `?${query}` : ''}`);
  },
  getMine: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/feed/me${query ? `?${query}` : ''}`);
  },
  getStats: () => apiFetch('/api/v1/feed/stats')
};

// ---------------------------------------------------------------------------
// Company Reviews API
// ---------------------------------------------------------------------------

export const companyReviewsApi = {
  list: (companyId, params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/companies/${companyId}/reviews${query ? `?${query}` : ''}`);
  },
  getStats: (companyId) => apiFetch(`/api/v1/companies/${companyId}/reviews/stats`),
  create: (companyId, data) => apiFetch(`/api/v1/companies/${companyId}/reviews`, { method: 'POST', body: data }),
  toggleHelpful: (companyId, reviewId) => apiFetch(`/api/v1/companies/${companyId}/reviews/${reviewId}/helpful`, { method: 'POST' })
};

// ---------------------------------------------------------------------------
// Job Recommendations API
// ---------------------------------------------------------------------------

export const recommendationsApi = {
  getJobs: (limit = 10) => apiFetch(`/api/v1/recommendations/jobs?limit=${limit}`)
};

// ---------------------------------------------------------------------------
// Export / Reports API
// ---------------------------------------------------------------------------

export const exportApi = {
  applicationsCSV: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return `${API_BASE_URL}/api/v1/export/applications${query ? `?${query}` : ''}`;
  },
  analyticsCSV: () => `${API_BASE_URL}/api/v1/export/analytics`,
  hiringSummary: () => apiFetch('/api/v1/export/hiring-summary')
};

// ---------------------------------------------------------------------------
// Outreach API
// ---------------------------------------------------------------------------

export const outreachApi = {
  send: (data) => apiFetch('/api/v1/outreach/send', { method: 'POST', body: data }),
  bulkSend: (data) => apiFetch('/api/v1/outreach/bulk-send', { method: 'POST', body: data })
};


