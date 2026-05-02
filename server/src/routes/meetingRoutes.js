import express from 'express'
import { createMeeting, getMeeting } from '../controllers/meetingController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/:matchId', createMeeting)
router.get('/:matchId', getMeeting)

export default router