import { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2, KeyRound, Sparkles, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function AuthScreen({ defaultMode = 'login' }) {
  const { login, register } = useAuth();
  const { readiness, triggerAlert } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = typeof location.state?.from === 'string' && location.state.from.startsWith('/')
    ? location.state.from
    : '/dashboard';

  const [isAuthMode, setIsAuthMode] = useState(defaultMode); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ email: '', password: '', role: 'candidate' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Password rules validation for registration
  const rules = useMemo(() => {
    return {
      length: authForm.password.length >= 8,
      uppercase: /[A-Z]/.test(authForm.password),
      lowercase: /[a-z]/.test(authForm.password),
      special: /[^a-zA-Z0-9]/.test(authForm.password)
    };
  }, [authForm.password]);

  const strengthPercentage = useMemo(() => {
    const passed = Object.values(rules).filter(Boolean).length;
    return (passed / 4) * 100;
  }, [rules]);

  const strengthColor = useMemo(() => {
    if (strengthPercentage <= 25) return 'var(--color-error)';
    if (strengthPercentage <= 75) return 'var(--color-warning)';
    return 'var(--color-success)';
  }, [strengthPercentage]);

  const strengthText = useMemo(() => {
    if (strengthPercentage === 0) return 'None';
    if (strengthPercentage <= 25) return 'Weak';
    if (strengthPercentage <= 75) return 'Medium';
    return 'Strong';
  }, [strengthPercentage]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (isAuthMode === 'login') {
        const res = await login({ email: authForm.email, password: authForm.password });
        if (res.success) {
          triggerAlert('Welcome to JobSprint!');
          navigate(requestedPath, { replace: true });
        }
      } else {
        // Enforce password strength before submit
        if (strengthPercentage < 100) {
          throw new Error('Please fulfill all password requirements before signing up');
        }
        await register(authForm);
        setSuccessMsg('Account created successfully! Please check your email (and developer console) to verify your account.');
        setIsAuthMode('login');
        setAuthForm(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
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
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">JS</span>
          <span className="brand-name">JobSprint</span>
        </div>
        <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
          <Activity size={16} />
          <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
        </div>
      </header>

      <main className="auth-card-wrapper">
        {/* Left screen - Promo Banner */}
        <div className="auth-banner">
          <div className="auth-banner-glow"></div>
          <div className="banner-content">
            <div className="banner-badge">
              <Sparkles size={14} />
              <span>Premium Job Portal</span>
            </div>
            <h1>Accelerate your hiring journey.</h1>
            <p>A high-impact workspace offering one-click applications, visual applicant pipelines, and in-app updates.</p>
            
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
        </div>

        {/* Right screen - Auth form */}
        <div className="auth-card">
          <h2>{isAuthMode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-subtitle">
            {isAuthMode === 'login' ? 'Sign in to access your dashboard' : 'Join as candidate or recruiter'}
          </p>

          {errorMsg && <div className="alert error">{errorMsg}</div>}
          {successMsg && <div className="alert success">{successMsg}</div>}

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
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="auth-password">Password</label>
                {isAuthMode === 'login' && (
                  <Link to="/forgot-password" state={{ from: requestedPath }} style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="password-input-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password strength indicators for register mode */}
            {isAuthMode === 'register' && authForm.password && (
              <div className="password-strength-section" style={{ margin: '16px 0', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Password strength:</span>
                  <span style={{ color: strengthColor }}>{strengthText}</span>
                </div>
                <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${strengthPercentage}%`, background: strengthColor, transition: 'width 0.3s' }}></div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', fontWeight: '500' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.length ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {rules.length ? <Check size={10} /> : <X size={10} />} At least 8 chars
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.uppercase ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {rules.uppercase ? <Check size={10} /> : <X size={10} />} Uppercase letter
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.lowercase ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {rules.lowercase ? <Check size={10} /> : <X size={10} />} Lowercase letter
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.special ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {rules.special ? <Check size={10} /> : <X size={10} />} Special character
                  </li>
                </ul>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? (
                <><Loader2 size={16} className="spinner-icon" /> {isAuthMode === 'login' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                isAuthMode === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </button>

            <div className="auth-toggle">
              {isAuthMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setIsAuthMode('register'); setErrorMsg(null); setSuccessMsg(null); }}>
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setIsAuthMode('login'); setErrorMsg(null); setSuccessMsg(null); }}>
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
