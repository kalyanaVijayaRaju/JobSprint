import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { settingsApi } from '../api/client.js';
import { Settings, User, Bell, Shield, Palette, Save, Check, Globe, Clock } from 'lucide-react';
import { Button, Spinner, Badge } from '../components/ui';

const TABS = [
  { key: 'account', label: 'Account', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy', label: 'Privacy', icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
];

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-info">
        <span className="settings-toggle-label">{label}</span>
        {description && <span className="settings-toggle-desc">{description}</span>}
      </div>
      <button
        type="button"
        className={`settings-toggle ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="settings-toggle-thumb" />
      </button>
    </div>
  );
}

function SelectField({ value, onChange, options, label }) {
  return (
    <div className="settings-select-row">
      <label className="settings-select-label">{label}</label>
      <select
        className="settings-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await settingsApi.getPreferences();
      if (res?.success) setPrefs(res.data.preferences);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const updatePref = async (data) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await settingsApi.updatePreferences(data);
      if (res?.success) {
        setPrefs(res.data.preferences);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="lg" label="Loading settings..." />
      </div>
    );
  }

  const email = prefs?.emailNotifications || {};
  const push = prefs?.pushNotifications || {};
  const privacy = prefs?.privacy || {};

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>
          <Settings size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Settings
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
          Manage your account preferences and privacy settings
        </p>
        {saved && (
          <Badge style={{ background: '#10b98122', color: '#10b981', marginLeft: 'auto' }}>
            <Check size={14} /> Saved
          </Badge>
        )}
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`settings-nav-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'account' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Account Information</h3>
              <div className="settings-info-grid">
                <div className="settings-info-item">
                  <label>Email</label>
                  <span>{user?.email || '—'}</span>
                </div>
                <div className="settings-info-item">
                  <label>Role</label>
                  <Badge>{user?.role}</Badge>
                </div>
                <div className="settings-info-item">
                  <label>Account Status</label>
                  <Badge style={{ background: '#10b98122', color: '#10b981' }}>Active</Badge>
                </div>
              </div>

              <h3 className="settings-section-title" style={{ marginTop: '28px' }}>Regional</h3>
              <SelectField
                label="Language"
                value={prefs?.language || 'en'}
                onChange={(v) => updatePref({ language: v })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'te', label: 'Telugu' },
                  { value: 'ta', label: 'Tamil' },
                  { value: 'kn', label: 'Kannada' }
                ]}
              />
              <SelectField
                label="Timezone"
                value={prefs?.timezone || 'Asia/Kolkata'}
                onChange={(v) => updatePref({ timezone: v })}
                options={[
                  { value: 'Asia/Kolkata', label: 'IST (India Standard Time)' },
                  { value: 'America/New_York', label: 'EST (Eastern US)' },
                  { value: 'America/Los_Angeles', label: 'PST (Pacific US)' },
                  { value: 'Europe/London', label: 'GMT (London)' },
                  { value: 'Asia/Singapore', label: 'SGT (Singapore)' }
                ]}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Email Notifications</h3>
              <ToggleSwitch
                checked={email.jobAlerts !== false}
                onChange={(v) => updatePref({ emailNotifications: { jobAlerts: v } })}
                label="Job Alerts"
                description="Get notified when new jobs matching your preferences are posted"
              />
              <ToggleSwitch
                checked={email.applicationUpdates !== false}
                onChange={(v) => updatePref({ emailNotifications: { applicationUpdates: v } })}
                label="Application Updates"
                description="Receive updates when your application status changes"
              />
              <ToggleSwitch
                checked={email.messages !== false}
                onChange={(v) => updatePref({ emailNotifications: { messages: v } })}
                label="Messages"
                description="Get notified when you receive a new message"
              />
              <ToggleSwitch
                checked={email.weeklyDigest || false}
                onChange={(v) => updatePref({ emailNotifications: { weeklyDigest: v } })}
                label="Weekly Digest"
                description="Receive a weekly summary of job market activity"
              />
              <ToggleSwitch
                checked={email.marketing || false}
                onChange={(v) => updatePref({ emailNotifications: { marketing: v } })}
                label="Marketing Emails"
                description="Receive promotional emails and career tips"
              />

              <h3 className="settings-section-title" style={{ marginTop: '28px' }}>Push Notifications</h3>
              <ToggleSwitch
                checked={push.enabled !== false}
                onChange={(v) => updatePref({ pushNotifications: { enabled: v } })}
                label="Enable Push Notifications"
                description="Receive real-time notifications in your browser"
              />
              <ToggleSwitch
                checked={push.interviewReminders !== false}
                onChange={(v) => updatePref({ pushNotifications: { interviewReminders: v } })}
                label="Interview Reminders"
                description="Get reminded before upcoming interviews"
              />
              <ToggleSwitch
                checked={push.newMessages !== false}
                onChange={(v) => updatePref({ pushNotifications: { newMessages: v } })}
                label="New Messages"
                description="Notify when you receive a new message"
              />
              <ToggleSwitch
                checked={push.statusChanges !== false}
                onChange={(v) => updatePref({ pushNotifications: { statusChanges: v } })}
                label="Status Changes"
                description="Get notified when application status changes"
              />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Profile Visibility</h3>
              <SelectField
                label="Who can see your profile?"
                value={privacy.profileVisibility || 'public'}
                onChange={(v) => updatePref({ privacy: { profileVisibility: v } })}
                options={[
                  { value: 'public', label: 'Everyone' },
                  { value: 'recruiters-only', label: 'Recruiters Only' },
                  { value: 'private', label: 'Private (Only You)' }
                ]}
              />

              <h3 className="settings-section-title" style={{ marginTop: '28px' }}>Contact Information</h3>
              <ToggleSwitch
                checked={privacy.showEmail || false}
                onChange={(v) => updatePref({ privacy: { showEmail: v } })}
                label="Show Email Address"
                description="Allow others to see your email on your profile"
              />
              <ToggleSwitch
                checked={privacy.showPhone || false}
                onChange={(v) => updatePref({ privacy: { showPhone: v } })}
                label="Show Phone Number"
                description="Allow others to see your phone number on your profile"
              />

              <h3 className="settings-section-title" style={{ marginTop: '28px' }}>Messaging</h3>
              <SelectField
                label="Who can message you?"
                value={privacy.allowMessagesFrom || 'everyone'}
                onChange={(v) => updatePref({ privacy: { allowMessagesFrom: v } })}
                options={[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'recruiters-only', label: 'Recruiters Only' },
                  { value: 'nobody', label: 'Nobody' }
                ]}
              />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Theme</h3>
              <div className="settings-theme-grid">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={`settings-theme-card ${prefs?.theme === theme ? 'active' : ''}`}
                    onClick={() => updatePref({ theme })}
                  >
                    <div className={`settings-theme-preview ${theme}`}>
                      <div className="settings-theme-preview-sidebar" />
                      <div className="settings-theme-preview-content">
                        <div className="settings-theme-preview-bar" />
                        <div className="settings-theme-preview-block" />
                      </div>
                    </div>
                    <span className="settings-theme-label">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
