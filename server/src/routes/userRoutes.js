import express from 'express'
import { upload } from '../lib/cloudinary.js'
import {
  getMe,
  updateMe,
  addSkill,
  addWant,
  removeSkill,
  removeWant,
  getAllUsers,
  uploadAvatar,
} from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes are protected
router.use(authMiddleware)

router.get('/', getAllUsers)
router.get('/me', getMe)
router.put('/me', updateMe)
router.post('/avatar', upload.single('avatar'), uploadAvatar)
router.post('/skills', addSkill)
router.post('/wants', addWant)
router.delete('/skills/:skillId', removeSkill)
router.delete('/wants/:skillId', removeWant)

export default router