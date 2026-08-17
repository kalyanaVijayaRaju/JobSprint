import { useState, useEffect } from 'react';
import { emailTemplatesApi, outreachApi } from '../../api/client.js';
import { Send, Mail, Check, AlertCircle } from 'lucide-react';
import { Button, Modal, Spinner } from '../ui';

export default function OutreachComposer({ candidate = null, isOpen, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [candidateEmail, setCandidateEmail] = useState(candidate?.email || '');
  const [candidateName, setCandidateName] = useState(candidate?.name || '');
  const [jobTitle, setJobTitle] = useState(candidate?.jobTitle || 'Software Engineer');
  const [rendered, setRendered] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSuccess(false);
    emailTemplatesApi.list()
      .then((res) => {
        if (res.success && res.data.templates?.length > 0) {
          setTemplates(res.data.templates);
          setSelectedTemplateId(res.data.templates[0]._id);
        }
      })
      .catch(() => setTemplates([]));
  }, [isOpen]);

  useEffect(() => {
    if (candidate) {
      setCandidateEmail(candidate.email || '');
      setCandidateName(candidate.name || '');
      if (candidate.jobTitle) setJobTitle(candidate.jobTitle);
    }
  }, [candidate]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    emailTemplatesApi.render(selectedTemplateId, {
      candidateName: candidateName || 'Candidate',
      jobTitle: jobTitle || 'Position',
      companyName: 'JobSprint'
    })
      .then((res) => {
        if (res.success) setRendered(res.data);
      })
      .catch(() => setRendered({ subject: '', body: '' }));
  }, [selectedTemplateId, candidateName, jobTitle]);

  const handleSend = async () => {
    if (!candidateEmail) return alert('Candidate email is required');
    try {
      setSending(true);
      const res = await outreachApi.send({
        templateId: selectedTemplateId,
        candidateEmail,
        candidateName,
        jobTitle
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      alert(err.message || 'Failed to send outreach email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Recruiter Outreach Email">
      <div style={{ padding: '16px' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#10b981' }}>
            <Check size={48} style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: 0 }}>Outreach Email Sent!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Delivered to {candidateEmail}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Email Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                {templates.map(t => <option key={t._id} value={t._id}>{t.name} ({t.category})</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Candidate Email</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            {/* Email Preview */}
            <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>SUBJECT</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{rendered.subject || 'Loading subject...'}</div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>MESSAGE BODY</div>
              <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--color-text)' }}>
                {rendered.body || 'Loading preview...'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleSend} disabled={sending}>
                <Send size={16} /> {sending ? 'Sending...' : 'Send Outreach Email'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
