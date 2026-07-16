import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../api/client.js';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const calledVerify = useRef(false);

  useEffect(() => {
    if (calledVerify.current) return;
    calledVerify.current = true;

    authApi.verifyEmail(token)
      .then((res) => {
        if (res.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(res.message || 'Validation failed');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message || 'Invalid or expired verification token');
      });
  }, [token]);

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="brand">
          <span className="brand-mark">JS</span>
          <span className="brand-name">JobSprint</span>
        </div>
      </header>

      <main className="auth-card-wrapper" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
          {status === 'verifying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={40} className="spinner-icon" style={{ color: 'var(--color-primary)' }} />
              <h2>Verifying your email</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Please hold tight while we verify your email address with the server...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', marginBottom: '24px' }}>
                <CheckCircle size={40} />
              </div>
              <h2>Email verified!</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                Your email address has been successfully verified. You can now log into your JobSprint workspace.
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                Log In to Account
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--color-error-light)', color: 'var(--color-error)', marginBottom: '24px' }}>
                <XCircle size={40} />
              </div>
              <h2>Verification failed</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                {errorMsg}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/login" className="btn btn-outline btn-block">
                  Go to Sign In
                </Link>
                <Link to="/" style={{ fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
