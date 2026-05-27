import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { sendVerificationEmail } from '../services/mailService.js'

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: true,
      },
    })

    // Generate verification token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Send verification email
    await sendVerificationEmail(email, token)

    res.status(201).json({
      message: 'Registration successful!',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Update user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
    })

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    res.redirect(`${clientUrl}/login?verified=true`)
  } catch (error) {
    console.error(error)
    res.redirect('http://localhost:5173/login?verified=false')
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check verification
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}