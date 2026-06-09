import express from 'express';
import { getNurseThreads, deleteChatThread } from '../controllers/chatController.js';

const router = express.Router();

// Fetching thread list
router.get('/threads', getNurseThreads);
router.delete('/thread/:roomId', deleteChatThread);

export default router;