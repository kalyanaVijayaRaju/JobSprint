import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authApi } from '../api/client.js';

export default function ChangePassword({ onSuccess }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength] || '';
  const strengthColor = ['', '#e11d48', '#d97706', '#d97706', '#059669', '#0f766e'][strength] || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onSuccess) onSuccess('Password changed successfully! Please log in again with your new password.');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="security-card change-password-card">
      <div className="security-card-header">
        <Lock size={20} />
        <h3>Change Password</h3>
      </div>
      <p className="card-description">
        Update your password regularly to keep your account secure. You'll need your current password to make changes.
      </p>

      {success && (
        <div className="security-alert security-alert-success">
          <CheckCircle2 size={16} />
          <span>Password updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="security-alert security-alert-error">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <div className="password-input-wrapper">
            <input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={(e) => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <div className="password-input-wrapper">
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowNew(!showNew)}
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.newPassword && (
            <div className="password-strength">
              <div className="strength-bar-bg">
                <div
                  className="strength-bar-fill"
                  style={{ width: `${(strength / 5) * 100}%`, background: strengthColor }}
                />
              </div>
              <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <span className="field-error">Passwords do not match</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
