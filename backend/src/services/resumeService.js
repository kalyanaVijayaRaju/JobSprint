import Resume from '../models/Resume.js';
import ApiError from '../utils/apiError.js';

/**
 * List all resumes for a user.
 */
export const listResumes = async (userId) => {
  return Resume.find({ userId }).sort({ updatedAt: -1 }).lean();
};

/**
 * Get a single resume by ID (scoped to user).
 */
export const getResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId }).lean();
  if (!resume) throw new ApiError(404, 'Resume not found');
  return resume;
};

/**
 * Create a new resume with default sections.
 */
export const createResume = async (userId, data = {}) => {
  const defaultSections = [
    { type: 'summary', title: 'Professional Summary', order: 0, content: '', items: [] },
    { type: 'experience', title: 'Work Experience', order: 1, items: [] },
    { type: 'education', title: 'Education', order: 2, items: [] },
    { type: 'skills', title: 'Skills', order: 3, items: [] },
    { type: 'projects', title: 'Projects', order: 4, items: [] },
    { type: 'certifications', title: 'Certifications', order: 5, items: [] }
  ];

  const resume = await Resume.create({
    userId,
    title: data.title || 'My Resume',
    template: data.template || 'modern',
    personalInfo: data.personalInfo || {},
    sections: data.sections || defaultSections,
    colorScheme: data.colorScheme || undefined,
    fontFamily: data.fontFamily || undefined,
    isDefault: data.isDefault || false
  });

  return resume;
};

/**
 * Update an existing resume.
 */
export const updateResume = async (resumeId, userId, data) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) throw new ApiError(404, 'Resume not found');

  const allowed = ['title', 'template', 'personalInfo', 'sections', 'colorScheme', 'fontFamily', 'isDefault'];
  allowed.forEach((field) => {
    if (data[field] !== undefined) resume[field] = data[field];
  });

  await resume.save();
  return resume;
};

/**
 * Delete a resume.
 */
export const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
  if (!resume) throw new ApiError(404, 'Resume not found');
  return resume;
};

/**
 * Generate HTML for resume preview / PDF.
 */
export const generateResumeHTML = async (resumeId, userId) => {
  const resume = await getResume(resumeId, userId);
  const p = resume.personalInfo || {};
  const colors = resume.colorScheme || { primary: '#6366f1', secondary: '#1e293b', accent: '#10b981' };
  const font = resume.fontFamily || 'Inter';

  const renderItems = (items) => items.map((item) => `
    <div class="resume-item">
      <div class="resume-item-header">
        <strong>${item.title || ''}</strong>
        ${item.subtitle ? `<span class="resume-item-sub">${item.subtitle}</span>` : ''}
      </div>
      ${item.location || item.startDate ? `
        <div class="resume-item-meta">
          ${item.location ? `<span>${item.location}</span>` : ''}
          ${item.startDate ? `<span>${new Date(item.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – ${item.current ? 'Present' : item.endDate ? new Date(item.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}</span>` : ''}
        </div>
      ` : ''}
      ${item.description ? `<p class="resume-item-desc">${item.description}</p>` : ''}
      ${item.bullets && item.bullets.length ? `<ul>${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
      ${item.tags && item.tags.length ? `<div class="resume-tags">${item.tags.map(t => `<span class="resume-tag">${t}</span>`).join('')}</div>` : ''}
      ${item.level ? `<span class="resume-level">${item.level}</span>` : ''}
    </div>
  `).join('');

  const renderSkills = (items) => `
    <div class="resume-skills-grid">
      ${items.map(item => `
        <div class="resume-skill-item">
          <span class="resume-skill-name">${item.title || ''}</span>
          ${item.level ? `<span class="resume-skill-level">${item.level}</span>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  const sortedSections = [...(resume.sections || [])].filter(s => s.visible !== false).sort((a, b) => a.order - b.order);

  const sectionsHTML = sortedSections.map(section => `
    <div class="resume-section">
      <h2 class="resume-section-title">${section.title}</h2>
      ${section.type === 'summary' ? `<p class="resume-summary">${section.content || ''}</p>` : ''}
      ${section.type === 'skills' ? renderSkills(section.items || []) : ''}
      ${!['summary', 'skills'].includes(section.type) ? renderItems(section.items || []) : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resume.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: '${font}', sans-serif; color: ${colors.secondary}; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
    .resume-header { text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px solid ${colors.primary}; }
    .resume-name { font-size: 28px; font-weight: 700; color: ${colors.primary}; margin-bottom: 4px; }
    .resume-headline { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .resume-contact { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; font-size: 13px; color: #475569; }
    .resume-contact a { color: ${colors.primary}; text-decoration: none; }
    .resume-section { margin-bottom: 24px; }
    .resume-section-title { font-size: 16px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px; border-bottom: 2px solid ${colors.accent}; margin-bottom: 12px; }
    .resume-summary { font-size: 14px; color: #475569; }
    .resume-item { margin-bottom: 14px; }
    .resume-item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .resume-item-header strong { font-size: 15px; }
    .resume-item-sub { font-size: 13px; color: #64748b; font-style: italic; }
    .resume-item-meta { font-size: 12px; color: #94a3b8; margin: 2px 0 6px; display: flex; gap: 12px; }
    .resume-item-desc { font-size: 13px; margin-bottom: 4px; }
    ul { padding-left: 18px; font-size: 13px; }
    ul li { margin-bottom: 3px; }
    .resume-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .resume-tag { background: ${colors.primary}15; color: ${colors.primary}; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .resume-skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .resume-skill-item { display: flex; justify-content: space-between; padding: 6px 10px; background: #f1f5f9; border-radius: 6px; font-size: 13px; }
    .resume-skill-level { font-size: 11px; color: ${colors.accent}; font-weight: 600; text-transform: capitalize; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="resume-header">
    <div class="resume-name">${p.fullName || 'Your Name'}</div>
    ${p.headline ? `<div class="resume-headline">${p.headline}</div>` : ''}
    <div class="resume-contact">
      ${p.email ? `<span>${p.email}</span>` : ''}
      ${p.phone ? `<span>${p.phone}</span>` : ''}
      ${p.location ? `<span>${p.location}</span>` : ''}
      ${p.website ? `<a href="${p.website}" target="_blank">Portfolio</a>` : ''}
      ${p.linkedin ? `<a href="${p.linkedin}" target="_blank">LinkedIn</a>` : ''}
      ${p.github ? `<a href="${p.github}" target="_blank">GitHub</a>` : ''}
    </div>
  </div>
  ${sectionsHTML}
</body>
</html>`;
};
