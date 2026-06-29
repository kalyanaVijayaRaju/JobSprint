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
  login:    (data) => apiFetch('/api/v1/auth/login', { method: 'POST', body: data }),
  logout:   ()     => apiFetch('/api/v1/auth/logout', { method: 'POST' }),
  getMe:    ()     => apiFetch('/api/v1/auth/me')
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
  get:    ()     => apiFetch('/api/v1/users/profile'),
  update: (data) => apiFetch('/api/v1/users/profile', { method: 'PUT', body: data })
};
