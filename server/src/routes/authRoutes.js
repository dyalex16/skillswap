import express from 'express'
import { register, verifyEmail, login } from '../controllers/authController.js'
import { registerRules, loginRules, validate } from '../middleware/validators.js'

const router = express.Router()

router.post('/register', registerRules, validate, register)
router.get('/verify/:token', verifyEmail)
router.post('/login', loginRules, validate, login)

export default router