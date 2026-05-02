import express from 'express'
import { getMessages, getUnreadCounts, markAsRead } from '../controllers/chatController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/unread', getUnreadCounts)
router.put('/:matchId/read', markAsRead)
router.get('/:matchId', getMessages)

export default router