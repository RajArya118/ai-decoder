import express from 'express';
import {
  getHistory,
  toggleBookmark,
  deleteHistoryItem,
  exportHistory
} from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getHistory);
router.get('/export', exportHistory);
router.patch('/:id/bookmark', toggleBookmark);
router.delete('/:id', deleteHistoryItem);

export default router;
