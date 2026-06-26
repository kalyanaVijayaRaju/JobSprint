const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getReadiness = async () => {
  const response = await fetch(`${API_BASE_URL}/health/ready`);
  const payload = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: payload.status || 'UNKNOWN',
    timestamp: payload.timestamp || null
  };
};
