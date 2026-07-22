/**
 * General information form tab (first name, last name, phone, summary, skills / job title).
 */
export default function GeneralInfoForm({
  user,
  profileForm,
  onChange,
}) {
  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>General Information</h3>
      <div className="form-row-2">
        <div className="form-group">
          <label htmlFor="first-name">First Name</label>
          <input
            id="first-name"
            type="text"
            value={profileForm.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last-name">Last Name</label>
          <input
            id="last-name"
            type="text"
            value={profileForm.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          type="text"
          placeholder="+1234567890"
          value={profileForm.phone}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="summary">Professional Summary</label>
        <textarea
          id="summary"
          rows={4}
          placeholder="Short description of your background and credentials..."
          value={profileForm.summary}
          onChange={(e) => onChange('summary', e.target.value)}
        />
      </div>

      {user.role === 'candidate' ? (
        <div className="form-group">
          <label htmlFor="skills">Professional Skills (comma-separated)</label>
          <input
            id="skills"
            type="text"
            placeholder="React, CSS, Node.js, JavaScript"
            value={profileForm.skills}
            onChange={(e) => onChange('skills', e.target.value)}
          />
        </div>
      ) : (
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="job-title">Job Title</label>
            <input
              id="job-title"
              type="text"
              placeholder="e.g. Hiring Manager"
              value={profileForm.jobTitle}
              onChange={(e) => onChange('jobTitle', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="company-select">Associated Company ID</label>
            <input
              id="company-select"
              type="text"
              placeholder="Paste verified Company ID"
              value={profileForm.companyId}
              onChange={(e) => onChange('companyId', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
