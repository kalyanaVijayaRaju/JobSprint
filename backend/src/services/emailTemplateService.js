import EmailTemplate from '../models/EmailTemplate.js';
import ApiError from '../utils/apiError.js';

/**
 * List all templates for a recruiter, optionally filtered by category.
 */
export const listTemplates = async (recruiterId, category) => {
  const query = { recruiterId };
  if (category) query.category = category;

  return EmailTemplate.find(query).sort({ createdAt: -1 }).lean();
};

/**
 * Get a single template by ID (scoped to recruiter).
 */
export const getTemplate = async (templateId, recruiterId) => {
  const template = await EmailTemplate.findOne({ _id: templateId, recruiterId }).lean();
  if (!template) {
    throw new ApiError(404, 'Email template not found');
  }
  return template;
};

/**
 * Create a new email template.
 */
export const createTemplate = async (recruiterId, data) => {
  const template = await EmailTemplate.create({
    recruiterId,
    name: data.name,
    subject: data.subject,
    body: data.body,
    variables: data.variables,
    category: data.category || 'custom',
    isDefault: data.isDefault || false
  });
  return template;
};

/**
 * Update an existing template.
 */
export const updateTemplate = async (templateId, recruiterId, data) => {
  const template = await EmailTemplate.findOne({ _id: templateId, recruiterId });
  if (!template) {
    throw new ApiError(404, 'Email template not found');
  }

  if (data.name !== undefined) template.name = data.name;
  if (data.subject !== undefined) template.subject = data.subject;
  if (data.body !== undefined) template.body = data.body;
  if (data.variables !== undefined) template.variables = data.variables;
  if (data.category !== undefined) template.category = data.category;
  if (data.isDefault !== undefined) template.isDefault = data.isDefault;

  await template.save();
  return template;
};

/**
 * Delete a template.
 */
export const deleteTemplate = async (templateId, recruiterId) => {
  const template = await EmailTemplate.findOneAndDelete({ _id: templateId, recruiterId });
  if (!template) {
    throw new ApiError(404, 'Email template not found');
  }
  return template;
};

/**
 * Render a template by replacing variable placeholders with actual values.
 */
export const renderTemplate = async (templateId, recruiterId, variables = {}) => {
  const template = await getTemplate(templateId, recruiterId);

  let renderedSubject = template.subject;
  let renderedBody = template.body;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    renderedSubject = renderedSubject.replace(placeholder, value);
    renderedBody = renderedBody.replace(placeholder, value);
  }

  return {
    subject: renderedSubject,
    body: renderedBody
  };
};
