import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle, Check, X } from 'lucide-react';
import { authApi } from '../api/client.js';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Password rules validation
  const rules = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
      match: password && password === confirmPassword
    };
  }, [password, confirmPassword]);

  const strengthPercentage = useMemo(() => {
    const passed = Object.values(rules).filter(Boolean).length;
    return (passed / 5) * 100;
  }, [rules]);

  const strengthColor = useMemo(() => {
    if (strengthPercentage <= 40) return 'var(--color-error)';
    if (strengthPercentage <= 80) return 'var(--color-warning)';
    return 'var(--color-success)';
  }, [strengthPercentage]);

  const strengthText = useMemo(() => {
    if (strengthPercentage === 0) return 'None';
    if (strengthPercentage <= 40) return 'Weak';
    if (strengthPercentage <= 80) return 'Medium';
    return 'Strong';
  }, [strengthPercentage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="brand">
          <span className="brand-mark">JS</span>
          <span className="brand-name">JobSprint</span>
        </div>
      </header>

      <main className="auth-card-wrapper" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '480px', width: '100%' }}>
          {success ? (
            <div className="reset-success-state" style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', marginBottom: '24px' }}>
                <CheckCircle size={40} />
              </div>
              <h2>Password reset complete</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                Your password has been successfully reset. You can now sign in with your new credentials.
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2>Create new password</h2>
              <p className="auth-subtitle">
                Please enter a strong password containing letters, numbers, and special characters.
              </p>

              {errorMsg && <div className="alert error">{errorMsg}</div>}

              <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '24px' }}>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Strength Indicator */}
                <div className="password-strength-section" style={{ margin: '16px 0', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Password strength:</span>
                    <span style={{ color: strengthColor }}>{strengthText}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strengthPercentage}%`, background: strengthColor, transition: 'width 0.3s ease' }}></div>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontWeight: '500' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.length ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {rules.length ? <Check size={12} /> : <X size={12} />} At least 8 chars
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.uppercase ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {rules.uppercase ? <Check size={12} /> : <X size={12} />} One uppercase letter
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.lowercase ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {rules.lowercase ? <Check size={12} /> : <X size={12} />} One lowercase letter
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.special ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {rules.special ? <Check size={12} /> : <X size={12} />} Special character
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.match ? 'var(--color-success)' : 'var(--color-text-muted)', gridColumn: 'span 2' }}>
                      {rules.match ? <Check size={12} /> : <X size={12} />} Passwords match
                    </li>
                  </ul>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading || strengthPercentage < 100}>
                  {loading ? (
                    <><Loader2 size={16} className="spinner-icon" /> Resetting Password...</>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
