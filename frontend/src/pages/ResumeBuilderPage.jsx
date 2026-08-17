import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { resumesApi } from '../api/client.js';
import {
  FileText, Plus, Trash2, Eye, Download, Save, Palette, Layout,
  Sparkles, Check, ChevronDown, ChevronUp, Copy, ExternalLink, Globe, Phone, Mail, MapPin
} from 'lucide-react';
import { Button, Badge, Spinner, EmptyState, Modal } from '../components/ui';

const TEMPLATES = [
  { id: 'modern', name: 'Modern Clean', desc: 'Clean layout with bold headers and soft accent colors' },
  { id: 'classic', name: 'Classic Executive', desc: 'Traditional serif typography for formal corporate roles' },
  { id: 'minimal', name: 'Minimalist', desc: 'Sleek single-column design highlighting key impact' },
  { id: 'creative', name: 'Creative Tech', desc: 'Vibrant sidebar layout for developers and designers' }
];

const FONTS = ['Inter', 'Roboto', 'Merriweather', 'Lato', 'Open Sans'];

const COLORS = [
  { primary: '#6366f1', secondary: '#1e293b', accent: '#10b981', name: 'Indigo' },
  { primary: '#2563eb', secondary: '#0f172a', accent: '#f59e0b', name: 'Ocean Blue' },
  { primary: '#0d9488', secondary: '#134e4a', accent: '#6366f1', name: 'Teal' },
  { primary: '#7c3aed', secondary: '#1e1b4b', accent: '#ec4899', name: 'Purple Gradient' },
  { primary: '#059669', secondary: '#064e3b', accent: '#3b82f6', name: 'Emerald' }
];

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'templates' | 'style'

  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await resumesApi.list();
      if (res.success) {
        setResumes(res.data.resumes || []);
        if (res.data.resumes?.length > 0 && !activeResume) {
          setActiveResume(res.data.resumes[0]);
        }
      }
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [activeResume]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleCreateNew = async () => {
    try {
      setSaving(true);
      const res = await resumesApi.create({ title: `Resume ${resumes.length + 1}` });
      if (res.success && res.data.resume) {
        setResumes([res.data.resume, ...resumes]);
        setActiveResume(res.data.resume);
      }
    } catch (err) {
      alert(err.message || 'Failed to create resume');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!activeResume) return;
    try {
      setSaving(true);
      const res = await resumesApi.update(activeResume._id, activeResume);
      if (res.success && res.data.resume) {
        setActiveResume(res.data.resume);
        setResumes(resumes.map(r => r._id === res.data.resume._id ? res.data.resume : r));
      }
    } catch (err) {
      alert(err.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumesApi.delete(id);
      const updated = resumes.filter(r => r._id !== id);
      setResumes(updated);
      setActiveResume(updated[0] || null);
    } catch (err) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  const handlePreview = async () => {
    if (!activeResume) return;
    try {
      const res = await resumesApi.pdf(activeResume._id);
      if (res.success && res.data.html) {
        setPreviewHTML(res.data.html);
        setIsPreviewOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate preview');
    }
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(previewHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Helper state update functions
  const updatePersonalInfo = (field, value) => {
    setActiveResume({
      ...activeResume,
      personalInfo: { ...activeResume.personalInfo, [field]: value }
    });
  };

  const addSectionItem = (sectionIndex) => {
    const updatedSections = [...activeResume.sections];
    const section = updatedSections[sectionIndex];
    const newItem = section.type === 'skills'
      ? { title: 'New Skill', level: 'intermediate' }
      : { title: 'New Position / Title', subtitle: 'Company / Institution', description: '', startDate: new Date() };

    section.items = [...(section.items || []), newItem];
    setActiveResume({ ...activeResume, sections: updatedSections });
  };

  const updateSectionItem = (sectionIndex, itemIndex, field, value) => {
    const updatedSections = [...activeResume.sections];
    updatedSections[sectionIndex].items[itemIndex][field] = value;
    setActiveResume({ ...activeResume, sections: updatedSections });
  };

  const removeSectionItem = (sectionIndex, itemIndex) => {
    const updatedSections = [...activeResume.sections];
    updatedSections[sectionIndex].items.splice(itemIndex, 1);
    setActiveResume({ ...activeResume, sections: updatedSections });
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Spinner size="lg" label="Loading resumes..." /></div>;
  }

  return (
    <div className="resume-builder-page" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Resume & CV Builder</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '14px' }}>Build, customize, and export ATS-optimized resumes in seconds.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={activeResume?._id || ''}
            onChange={(e) => setActiveResume(resumes.find(r => r._id === e.target.value) || null)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '14px' }}
          >
            {resumes.map(r => <option key={r._id} value={r._id}>{r.title} ({r.template})</option>)}
          </select>

          <Button variant="outline" onClick={handleCreateNew} disabled={saving}>
            <Plus size={16} /> New Resume
          </Button>

          {activeResume && (
            <>
              <Button variant="outline" onClick={handlePreview}>
                <Eye size={16} /> Preview / Export PDF
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {!activeResume ? (
        <EmptyState
          icon={FileText}
          title="No resumes found"
          description="Create your first resume using our ATS-friendly templates."
          actionLabel="Create Resume"
          onAction={handleCreateNew}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Left Panel: Tabs & Settings */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <button
                type="button"
                className={`assessments-tab ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                Content
              </button>
              <button
                type="button"
                className={`assessments-tab ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                Template
              </button>
              <button
                type="button"
                className={`assessments-tab ${activeTab === 'style' ? 'active' : ''}`}
                onClick={() => setActiveTab('style')}
              >
                Styling
              </button>
            </div>

            {activeTab === 'editor' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Resume Title</h3>
                <input
                  type="text"
                  value={activeResume.title || ''}
                  onChange={(e) => setActiveResume({ ...activeResume, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '20px' }}
                />

                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Sections</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(activeResume.sections || []).map((sec, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px' }}>
                      <span style={{ fontWeight: 600 }}>{sec.title}</span>
                      <Badge style={{ fontSize: '11px' }}>{(sec.items || []).length} items</Badge>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(activeResume._id)}>
                    <Trash2 size={14} /> Delete Resume
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Choose Template</h3>
                {TEMPLATES.map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => setActiveResume({ ...activeResume, template: tmpl.id })}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: `2px solid ${activeResume.template === tmpl.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: activeResume.template === tmpl.id ? 'var(--color-primary-light, rgba(99, 102, 241, 0.08))' : 'var(--color-bg)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{tmpl.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{tmpl.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'style' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Color Palette</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {COLORS.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveResume({ ...activeResume, colorScheme: c })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `2px solid ${activeResume.colorScheme?.primary === c.primary ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.primary }} />
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.secondary }} />
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.accent }} />
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Typography Font</h3>
                <select
                  value={activeResume.fontFamily || 'Inter'}
                  onChange={(e) => setActiveResume({ ...activeResume, fontFamily: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Right Panel: Content Form Editor */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            {/* Personal Details */}
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Personal Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
                <input
                  type="text"
                  value={activeResume.personalInfo?.fullName || ''}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Professional Headline</label>
                <input
                  type="text"
                  value={activeResume.personalInfo?.headline || ''}
                  onChange={(e) => updatePersonalInfo('headline', e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
                <input
                  type="email"
                  value={activeResume.personalInfo?.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="rahul@example.com"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Phone</label>
                <input
                  type="text"
                  value={activeResume.personalInfo?.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            {/* Sections */}
            {(activeResume.sections || []).map((sec, secIdx) => (
              <div key={secIdx} style={{ marginBottom: '28px', background: 'var(--color-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{sec.title}</h3>
                  <Button variant="outline" size="sm" onClick={() => addSectionItem(secIdx)}>
                    <Plus size={14} /> Add Item
                  </Button>
                </div>

                {sec.type === 'summary' ? (
                  <textarea
                    rows={4}
                    value={sec.content || ''}
                    onChange={(e) => {
                      const updatedSections = [...activeResume.sections];
                      updatedSections[secIdx].content = e.target.value;
                      setActiveResume({ ...activeResume, sections: updatedSections });
                    }}
                    placeholder="Write a brief professional summary introducing your core experience and achievements..."
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(sec.items || []).map((item, itemIdx) => (
                      <div key={itemIdx} style={{ background: 'var(--color-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => removeSectionItem(secIdx, itemIdx)}
                          style={{ position: 'absolute', right: '12px', top: '12px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Title / Skill</label>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => updateSectionItem(secIdx, itemIdx, 'title', e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Company / Subtitle</label>
                            <input
                              type="text"
                              value={item.subtitle || ''}
                              onChange={(e) => updateSectionItem(secIdx, itemIdx, 'subtitle', e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                            />
                          </div>
                        </div>

                        {sec.type !== 'skills' && (
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Description</label>
                            <textarea
                              rows={2}
                              value={item.description || ''}
                              onChange={(e) => updateSectionItem(secIdx, itemIdx, 'description', e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview & Print Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Resume Preview & Export">
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '12px' }}>
            <Button variant="primary" onClick={handlePrintPDF}>
              <Download size={16} /> Download as PDF / Print
            </Button>
          </div>

          <iframe
            srcDoc={previewHTML}
            title="Resume Preview"
            style={{ width: '100%', height: '600px', border: '1px solid var(--color-border)', borderRadius: '8px' }}
          />
        </div>
      </Modal>
    </div>
  );
}
