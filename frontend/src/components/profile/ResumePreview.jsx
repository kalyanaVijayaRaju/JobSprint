import { Mail, Phone, MapPin, Globe, Code, ExternalLink } from 'lucide-react';

/**
 * Print-optimized HTML resume preview component.
 */
export default function ResumePreview({ profile }) {
  if (!profile) return null;

  const {
    firstName = '',
    lastName = '',
    phone = '',
    summary = '',
    skills = [],
    experience = [],
    education = [],
    portfolioLinks = {},
  } = profile;

  return (
    <div
      className="resume-print-container card"
      style={{
        padding: '36px',
        background: '#ffffff',
        color: '#1e293b',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
          {firstName} {lastName}
        </h1>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#64748b' }}>
          {phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {phone}
            </span>
          )}
          {portfolioLinks.github && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Code size={12} /> {portfolioLinks.github}
            </span>
          )}
          {portfolioLinks.linkedin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={12} /> {portfolioLinks.linkedin}
            </span>
          )}
          {portfolioLinks.website && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={12} /> {portfolioLinks.website}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', marginBottom: '8px' }}>
            Professional Summary
          </h3>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
            {summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', marginBottom: '8px' }}>
            Skills & Expertise
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  background: '#f1f5f9',
                  color: '#1e293b',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', marginBottom: '12px' }}>
            Work Experience
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                    {exp.position} — <span style={{ color: '#6366f1' }}>{exp.company}</span>
                  </h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -{' '}
                    {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                {exp.description && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', lineHeight: '1.5', color: '#475569' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', marginBottom: '12px' }}>
            Education
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {education.map((edu, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{edu.degree} in {edu.fieldOfStudy}</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{edu.institution}</div>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {new Date(edu.startDate).toLocaleDateString(undefined, { year: 'numeric' })} -{' '}
                  {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString(undefined, { year: 'numeric' }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
