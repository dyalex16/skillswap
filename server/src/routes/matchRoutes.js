import express from 'express'
import {
  getMatches,
  sendMatchRequest,
  cancelMatchRequest,
  getIncomingRequests,
  getSentRequests,
  updateMatchStatus,
  getAcceptedMatches,
} from '../controllers/matchController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getMatches)
router.post('/request', sendMatchRequest)
router.get('/incoming', getIncomingRequests)
router.get('/sent', getSentRequests)
router.get('/accepted', getAcceptedMatches)
router.patch('/:matchId', updateMatchStatus)
router.delete('/request/:matchId', cancelMatchRequest)

export default router;