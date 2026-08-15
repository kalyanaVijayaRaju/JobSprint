import * as emailTemplateService from '../services/emailTemplateService.js';

export const listTemplates = async (req, res, next) => {
  try {
    const { category } = req.query;
    const templates = await emailTemplateService.listTemplates(req.user._id, category);
    res.status(200).json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (req, res, next) => {
  try {
    const template = await emailTemplateService.getTemplate(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const template = await emailTemplateService.createTemplate(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const template = await emailTemplateService.updateTemplate(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    await emailTemplateService.deleteTemplate(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const renderTemplate = async (req, res, next) => {
  try {
    const rendered = await emailTemplateService.renderTemplate(
      req.params.id,
      req.user._id,
      req.body.variables || {}
    );
    res.status(200).json({
      success: true,
      data: { rendered }
    });
  } catch (error) {
    next(error);
  }
};
