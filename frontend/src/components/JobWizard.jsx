import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Send, Sparkles, X, MapPin, DollarSign, Clock, FileText, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { label: 'Basic Info', desc: 'Title, type & description' },
  { label: 'Requirements', desc: 'Required skills & experience' },
  { label: 'Compensation', desc: 'Location, type & salary' },
  { label: 'Preview & Publish', desc: 'Review your posting' }
];

export default function JobWizard({
  onPostJob,
  onClose,
  submittingJob
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skillsRequired: '',
    locationType: 'remote',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    jobType: 'full-time',
    expiresAt: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Field validation per step
  const stepValidation = useMemo(() => {
    const validations = [];

    // Step 0: Basic Info
    validations[0] = Boolean(
      formData.title.trim().length >= 3 && 
      formData.description.trim().length >= 10 &&
      formData.jobType
    );

    // Step 1: Requirements & Skills
    validations[1] = Boolean(
      formData.skillsRequired.trim().length > 0 &&
      formData.requirements.trim().length > 0
    );

    // Step 2: Compensation & Location
    validations[2] = Boolean(
      formData.location.trim().length >= 2 &&
      formData.locationType &&
      (!formData.salaryMin || Number(formData.salaryMin) >= 0) &&
      (!formData.salaryMax || Number(formData.salaryMax) >= Number(formData.salaryMin || 0))
    );

    // Step 3: Preview is always valid
    validations[3] = true;

    return validations;
  }, [formData]);

  const handleNext = () => {
    if (stepValidation[currentStep] && currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stepValidation.slice(0, 3).every(Boolean)) return;
    
    onPostJob(formData, () => {
      onClose();
    });
  };

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
      <div className="modal-content job-wizard-modal" style={{ maxWidth: '1000px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Job Posting Wizard</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Create a high-impact job post in four easy steps</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close wizard" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="stepper-bar" style={{ display: 'flex', background: 'var(--color-bg)', padding: '16px 24px', borderBottom: '1px solid var(--color-border)', justifyContent: 'space-between' }}>
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isActive || isCompleted ? 1 : 0.5, flex: 1 }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', display: 'block', color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{step.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }} className="hide-mobile">{step.desc}</span>
                </div>
                {idx < STEPS.length - 1 && <ChevronRight size={14} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />}
              </div>
            );
          })}
        </div>

        {/* Wizard Main Grid: Forms on left, Live Preview on right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }} className="wizard-split-grid">
          
          {/* Left: Input Form Panel */}
          <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              {/* Form Pages */}
              <div style={{ flex: 1 }}>
                {currentStep === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label>Job Title <span style={{ color: 'var(--color-error)' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Frontend Architect"
                        value={formData.title}
                        onChange={e => handleChange('title', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Must be at least 3 characters.</span>
                    </div>

                    <div className="form-group">
                      <label>Job Type <span style={{ color: 'var(--color-error)' }}>*</span></label>
                      <select value={formData.jobType} onChange={e => handleChange('jobType', e.target.value)}>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Job Description <span style={{ color: 'var(--color-error)' }}>*</span></label>
                      <textarea
                        rows={6}
                        placeholder="Detail the responsibilities, project scope, and daily requirements..."
                        value={formData.description}
                        onChange={e => handleChange('description', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Minimum 10 characters.</span>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label>Skills Required (comma-separated) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="React, Redux, Tailwind CSS, TypeScript"
                        value={formData.skillsRequired}
                        onChange={e => handleChange('skillsRequired', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>List key skills candidates will match against.</span>
                    </div>

                    <div className="form-group">
                      <label>Requirements & Qualifications (one per line) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                      <textarea
                        rows={6}
                        placeholder="e.g. 5+ years of experience with React&#10;Bachelor's degree in Computer Science&#10;Familiarity with CI/CD tools"
                        value={formData.requirements}
                        onChange={e => handleChange('requirements', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Enter at least one key requirement.</span>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Location (City, Country) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <input
                          type="text"
                          placeholder="e.g. Austin, TX"
                          value={formData.location}
                          onChange={e => handleChange('location', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location Type <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <select value={formData.locationType} onChange={e => handleChange('locationType', e.target.value)}>
                          <option value="remote">Remote</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="onsite">Onsite</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Min Salary (Annual USD)</label>
                        <input
                          type="number"
                          placeholder="e.g. 80000"
                          value={formData.salaryMin}
                          onChange={e => handleChange('salaryMin', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Max Salary (Annual USD)</label>
                        <input
                          type="number"
                          placeholder="e.g. 120000"
                          value={formData.salaryMax}
                          onChange={e => handleChange('salaryMax', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Currency</label>
                        <select value={formData.salaryCurrency} onChange={e => handleChange('salaryCurrency', e.target.value)}>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Post Expiration Date</label>
                      <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={e => handleChange('expiresAt', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: '16px' }}>
                      <Sparkles size={36} />
                    </div>
                    <h3>Ready to publish your posting?</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto 24px auto' }}>
                      Double check the details in the Live Preview panel. Once published, candidates can immediately search and apply for this opening.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ChevronLeft size={16} /> Back
                </button>

                {currentStep === STEPS.length - 1 ? (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingJob}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={16} /> {submittingJob ? 'Publishing...' : 'Publish Job Opening'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!stepValidation[currentStep]}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Live Preview Panel */}
          <div style={{ background: 'var(--color-bg)', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="hide-mobile">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Live Candidate Preview</span>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '600' }}>Active layout</span>
            </div>

            {/* Candidate View Simulator Card */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px', flex: 1, boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <h3 style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: 'var(--color-text-main)' }}>
                  {formData.title || 'Job Opening Title'}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                  Hiring Employer Entity
                </span>
              </div>

              {/* Metadata tags row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px' }}>
                  <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {formData.jobType}
                </span>
                <span className="badge" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px' }}>
                  <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {formData.locationType}
                </span>
              </div>

              {/* Details table grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)', padding: '12px 0' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>OFFICE LOCATION</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{formData.location || 'Pending info'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>SALARY ANNUALLY</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-success)' }}>
                    <DollarSign size={12} style={{ verticalAlign: 'middle' }} />
                    {formData.salaryMin ? Number(formData.salaryMin).toLocaleString() : 'Negotiable'}
                    {formData.salaryMax ? ` - ${Number(formData.salaryMax).toLocaleString()}` : ''} {formData.salaryCurrency}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>PRE-REQUISITES SKILLS</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {formData.skillsRequired ? formData.skillsRequired.split(',').map((skill, i) => (
                    <span key={i} style={{ background: 'var(--color-bg)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid var(--color-border)' }}>
                      {skill.trim()}
                    </span>
                  )) : (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Waiting for entry...</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ flex: 1, minHeight: '100px', maxHeight: '180px', overflowY: 'auto' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>ROLE SPECIFICATION</span>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {formData.description || 'Waiting for description input...'}
                </p>
              </div>

              {/* Requirements list */}
              {formData.requirements && (
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>EXPERIENCE & EDUCATION</span>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {formData.requirements.split('\n').filter(r => r.trim()).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
