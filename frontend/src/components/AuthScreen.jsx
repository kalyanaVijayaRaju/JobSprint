import { useState } from 'react';
import { Activity } from 'lucide-react';
import { authApi } from '../api/client.js';

export default function AuthScreen({ setUser, readiness }) {
  const [isAuthMode, setIsAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ email: '', password: '', role: 'candidate' });
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      let res;
      if (isAuthMode === 'login') {
        res = await authApi.login({ email: authForm.email, password: authForm.password });
      } else {
        res = await authApi.register(authForm);
        setIsAuthMode('login');
        return;
      }

      if (res.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  const setMockCredentials = (role) => {
    if (role === 'candidate') {
      setAuthForm({ email: 'candidate@jobsprint.com', password: 'StrongPassword123!', role: 'candidate' });
    } else {
      setAuthForm({ email: 'recruiter@jobsprint.com', password: 'StrongPassword123!', role: 'recruiter' });
    }
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="brand">
          <span className="brand-mark">JS</span>
          <span className="brand-name">JobSprint</span>
        </div>
        <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
          <Activity size={16} />
          <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
        </div>
      </header>

      <main className="auth-card-wrapper">
        <div className="auth-banner">
          <h1>Accelerate your hiring journey.</h1>
          <p>A premium job portal offering one-click applications, visual applicant pipelines, and in-app updates.</p>
          <div className="mock-accounts">
            <p className="eyebrow">Demo accounts</p>
            <div className="mock-buttons">
              <button type="button" onClick={() => { setIsAuthMode('login'); setMockCredentials('candidate'); }}>
                Candidate demo
              </button>
              <button type="button" onClick={() => { setIsAuthMode('login'); setMockCredentials('recruiter'); }}>
                Recruiter demo
              </button>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <h2>{isAuthMode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-subtitle">
            {isAuthMode === 'login' ? 'Sign in to access your dashboard' : 'Join as candidate or recruiter'}
          </p>

          {errorMsg && <div className="alert error">{errorMsg}</div>}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {isAuthMode === 'register' && (
              <div className="form-group role-selector">
                <label>I want to join as a:</label>
                <div className="radio-group">
                  <label className={authForm.role === 'candidate' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="role"
                      value="candidate"
                      checked={authForm.role === 'candidate'}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value }))}
                    />
                    Candidate
                  </label>
                  <label className={authForm.role === 'recruiter' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="role"
                      value="recruiter"
                      checked={authForm.role === 'recruiter'}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value }))}
                    />
                    Recruiter
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="name@company.com"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {isAuthMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>

            <div className="auth-toggle">
              {isAuthMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsAuthMode('register')}>
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsAuthMode('login')}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
