import express from 'express';
import { getSystemStats, getUsers, getAuditLogs } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admin role can access administrative endpoints
router.use(requireAuth, requireRole(['admin']));

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.get('/audit-logs', getAuditLogs);

export default router;
