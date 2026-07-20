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
  register:         (data) => apiFetch('/api/v1/auth/register', { method: 'POST', body: data }),
  login:            (data) => apiFetch('/api/v1/auth/login', { method: 'POST', body: data }),
  logout:           ()     => apiFetch('/api/v1/auth/logout', { method: 'POST' }),
  getMe:            ()     => apiFetch('/api/v1/auth/me'),
  changePassword:   (data) => apiFetch('/api/v1/auth/password', { method: 'PATCH', body: data }),
  forgotPassword:   (email) => apiFetch('/api/v1/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword:    (token, password) => apiFetch(`/api/v1/auth/reset-password/${token}`, { method: 'POST', body: { password } }),
  verifyEmail:      (token) => apiFetch(`/api/v1/auth/verify-email/${token}`),
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
  get:    (id)       => apiFetch(`/api/v1/companies/${id}`),
  create: (data)     => apiFetch('/api/v1/companies', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/v1/companies/${id}`, { method: 'PUT', body: data }),
  delete: (id)       => apiFetch(`/api/v1/companies/${id}`, { method: 'DELETE' })
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

  get:    (id)       => apiFetch(`/api/v1/jobs/${id}`),
  create: (data)     => apiFetch('/api/v1/jobs', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/v1/jobs/${id}`, { method: 'PUT', body: data }),
  delete: (id)       => apiFetch(`/api/v1/jobs/${id}`, { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Profile API
// ---------------------------------------------------------------------------

export const profileApi = {
  get:          ()     => apiFetch('/api/v1/users/profile'),
  update:       (data) => apiFetch('/api/v1/users/profile', { method: 'PUT', body: data }),
  uploadResume: (formData) => apiFetch('/api/v1/users/resume/upload', { method: 'POST', body: formData })
};

// ---------------------------------------------------------------------------
// Applications API
// ---------------------------------------------------------------------------

export const applicationsApi = {
  apply:           (jobId, data)       => apiFetch(`/api/v1/applications/${jobId}/apply`, { method: 'POST', body: data }),
  myApplications:  (params = {})       => {
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
  updateStatus:    (id, status)        => apiFetch(`/api/v1/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  addNote:         (id, note)          => apiFetch(`/api/v1/applications/${id}/notes`, { method: 'POST', body: { note } }),
  summary:         ()                  => apiFetch('/api/v1/applications/summary'),
  withdraw:        (id)                => apiFetch(`/api/v1/applications/${id}/withdraw`, { method: 'PATCH' })
};

// ---------------------------------------------------------------------------
// Saved Jobs API
// ---------------------------------------------------------------------------

export const savedJobsApi = {
  list:   (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/saved-jobs${query ? `?${query}` : ''}`);
  },
  save:   (jobId)       => apiFetch(`/api/v1/saved-jobs/${jobId}`, { method: 'POST' }),
  unsave: (jobId)       => apiFetch(`/api/v1/saved-jobs/${jobId}`, { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Notifications API
// ---------------------------------------------------------------------------

export const notificationsApi = {
  list:        (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/api/v1/notifications${query ? `?${query}` : ''}`);
  },
  unreadCount: ()            => apiFetch('/api/v1/notifications/unread-count'),
  markRead:    (id)          => apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: ()            => apiFetch('/api/v1/notifications/mark-all-read', { method: 'PATCH' }),
  delete:      (id)          => apiFetch(`/api/v1/notifications/${id}`, { method: 'DELETE' }),
  clearRead:   ()            => apiFetch('/api/v1/notifications/read', { method: 'DELETE' })
};

// ---------------------------------------------------------------------------
// Job Alerts API
// ---------------------------------------------------------------------------

export const jobAlertsApi = {
  list:   ()       => apiFetch('/api/v1/job-alerts'),
  create: (data)   => apiFetch('/api/v1/job-alerts', { method: 'POST', body: data }),
  delete: (id)     => apiFetch(`/api/v1/job-alerts/${id}`, { method: 'DELETE' })
};

