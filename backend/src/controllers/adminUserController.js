import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import {
  adminUserQuerySchema,
  auditLogQuerySchema
} from '../validations/adminUserValidation.js';
import {
  listUsers,
  updateUserStatus,
  listAuditLogs
} from '../services/adminUserService.js';

const getRequestContext = (req) => ({
  ipAddress: req.ip,
  userAgent: req.get('user-agent') || ''
});

const parseQuery = (schema, query) => {
  const result = schema.safeParse(query);

  if (!result.success) {
    const error = new ApiError(400, 'Invalid query parameters', true);
    error.details = result.error.issues.map((issue) => issue.message);
    throw error;
  }

  return result.data;
};

export const getUsers = asyncHandler(async (req, res) => {
  const query = parseQuery(adminUserQuerySchema, req.query);
  const result = await listUsers(query);

  res.status(200).json({
    success: true,
    data: result
  });
});

export const patchUserStatus = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(
    req.params.id,
    req.user.id,
    req.body,
    getRequestContext(req)
  );

  res.status(200).json({
    success: true,
    message: 'User account status updated successfully',
    data: { user }
  });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const query = parseQuery(auditLogQuerySchema, req.query);
  const result = await listAuditLogs(query);

  res.status(200).json({
    success: true,
    data: result
  });
});
