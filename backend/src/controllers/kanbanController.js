import asyncHandler from '../utils/asyncHandler.js';
import * as kanbanService from '../services/kanbanService.js';

export const getBoard = asyncHandler(async (req, res) => {
  const board = await kanbanService.getBoard(req.user.id, req.user.role);
  res.json({ success: true, data: board });
});

export const moveCard = asyncHandler(async (req, res) => {
  const result = await kanbanService.moveCard(req.params.applicationId, req.body.status, req.user.id, req.user.role);
  res.json({ success: true, data: result });
});
