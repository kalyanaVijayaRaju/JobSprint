import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
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
            <div className="forgot-success-state" style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', marginBottom: '24px' }}>
                <CheckCircle size={40} />
              </div>
              <h2>Check your inbox</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                If an account exists for <strong>{email}</strong>, we have sent a password reset link. Please check your email (and developer console) to continue.
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2>Reset password</h2>
              <p className="auth-subtitle">
                Enter your email address and we'll log a recovery link to reset your password.
              </p>

              {errorMsg && <div className="alert error">{errorMsg}</div>}

              <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '24px' }}>
                <div className="form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      style={{ paddingLeft: '40px' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '16px' }}>
                  {loading ? (
                    <><Loader2 size={16} className="spinner-icon" /> Sending Link...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <div className="auth-toggle">
                  <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: '500' }}>
                    <ArrowLeft size={16} /> Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
