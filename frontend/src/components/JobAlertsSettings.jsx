import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, ShieldAlert, CheckCircle2, CircleAlert, Sparkles, MapPin, DollarSign, Clock } from 'lucide-react';
import { jobAlertsApi } from '../api/client.js';

export default function JobAlertsSettings({ triggerAlert }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    keyword: '',
    locationType: '',
    jobType: '',
    minSalary: ''
  });

  const fetchAlerts = useCallback(() => {
    setLoading(true);
    jobAlertsApi.list()
      .then(res => {
        if (res.success && res.data) {
          setAlerts(res.data.alerts);
        }
      })
      .catch(err => triggerAlert(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [triggerAlert]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        keyword: formData.keyword.trim() || undefined,
        locationType: formData.locationType || undefined,
        jobType: formData.jobType || undefined,
        minSalary: formData.minSalary ? Number(formData.minSalary) : undefined
      };

      await jobAlertsApi.create(data);
      triggerAlert('Job alert subscription created!');
      setFormData({ keyword: '', locationType: '', jobType: '', minSalary: '' });
      fetchAlerts();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to unsubscribe from this job alert?')) return;
    try {
      await jobAlertsApi.delete(id);
      triggerAlert('Job alert deleted successfully');
      fetchAlerts();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  return (
    <div className="security-activity-card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Bell className="text-primary" size={20} />
        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '16px' }}>Manage Job Match Alerts</h3>
      </div>
      
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
        Set up match preferences. You will be notified instantly inside the portal whenever a recruiter posts a matching role!
      </p>

      {/* Subscription creation form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Create New Alert</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', marginBottom: '4px' }}>Keyword</label>
            <input
              type="text"
              placeholder="e.g. Node, React"
              value={formData.keyword}
              onChange={e => handleChange('keyword', e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', marginBottom: '4px' }}>Location Type</label>
            <select
              value={formData.locationType}
              onChange={e => handleChange('locationType', e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', marginBottom: '4px' }}>Job Type</label>
            <select
              value={formData.jobType}
              onChange={e => handleChange('jobType', e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="">Any</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', marginBottom: '4px' }}>Min Salary</label>
            <input
              type="number"
              placeholder="e.g. 90000"
              value={formData.minSalary}
              onChange={e => handleChange('minSalary', e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary btn-sm"
          style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px', marginTop: '6px' }}
        >
          <Plus size={14} /> {submitting ? 'Creating...' : 'Subscribe Alert'}
        </button>
      </form>

      {/* Alert subscriptions list */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Active Alerts ({alerts.length})</h4>
        
        {loading ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '16px', background: 'var(--color-bg)' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>No alert subscriptions configured yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {alerts.map(alert => (
              <div
                key={alert._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {alert.keyword && (
                    <span style={{ fontSize: '11px', fontWeight: '700', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '6px' }}>
                      "{alert.keyword}"
                    </span>
                  )}
                  {alert.locationType && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--color-text-secondary)', background: 'var(--color-border)', padding: '2px 6px', borderRadius: '4px' }}>
                      <MapPin size={10} /> {alert.locationType}
                    </span>
                  )}
                  {alert.jobType && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--color-text-secondary)', background: 'var(--color-border)', padding: '2px 6px', borderRadius: '4px' }}>
                      <Clock size={10} /> {alert.jobType}
                    </span>
                  )}
                  {alert.minSalary > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--color-success)', background: 'var(--color-success-light)', padding: '2px 6px', borderRadius: '4px' }}>
                      <DollarSign size={10} /> ≥ {alert.minSalary.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(alert._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Delete alert subscription"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
