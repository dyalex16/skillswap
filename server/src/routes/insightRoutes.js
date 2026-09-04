import express from 'express'
import { getMatchInsight } from '../controllers/insightController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/:matchId', getMatchInsight)

export default router