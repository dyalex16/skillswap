import prisma from '../lib/prisma.js'

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        createdAt: true,
        userSkills: {
          include: { skill: true }
        },
        userWants: {
          include: { skill: true }
        }
      }
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// UPDATE PROFILE
export const updateMe = async (req, res) => {
  try {
    const { name, bio, avatarUrl, latitude, longitude } = req.body

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
      }
    })

    res.status(200).json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// UPLOAD AVATAR
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: req.file.path },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      }
    })

    res.status(200).json({ message: 'Avatar updated!', user: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ADD A SKILL THE USER HAS
export const addSkill = async (req, res) => {
  try {
    const { skillName, level, category } = req.body

    const normalizedName = skillName.trim().toLowerCase()

    // Find or create the skill
    const skill = await prisma.skill.upsert({
      where: { name: normalizedName },
      update: {},
      create: { name: normalizedName, category }
    })

    // Link to user
    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: req.user.userId,
          skillId: skill.id
        }
      },
      update: { level },
      create: {
        userId: req.user.userId,
        skillId: skill.id,
        level
      }
    })

    res.status(201).json({ message: 'Skill added', userSkill })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ADD A SKILL THE USER WANTS
export const addWant = async (req, res) => {
  try {
    const { skillName, category } = req.body

    const normalizedName = skillName.trim().toLowerCase()

    // Find or create the skill
    const skill = await prisma.skill.upsert({
      where: { name: normalizedName },
      update: {},
      create: { name: normalizedName, category }
    })

    // Link to user
    const userWant = await prisma.userWant.upsert({
      where: {
        userId_skillId: {
          userId: req.user.userId,
          skillId: skill.id
        }
      },
      update: {},
      create: {
        userId: req.user.userId,
        skillId: skill.id,
      }
    })

    res.status(201).json({ message: 'Want added', userWant })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// REMOVE A SKILL THE USER HAS
export const removeSkill = async (req, res) => {
  try {
    const { skillId } = req.params

    await prisma.userSkill.delete({
      where: {
        userId_skillId: {
          userId: req.user.userId,
          skillId
        }
      }
    })

    res.status(200).json({ message: 'Skill removed' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// REMOVE A SKILL THE USER WANTS
export const removeWant = async (req, res) => {
  try {
    const { skillId } = req.params

    await prisma.userWant.delete({
      where: {
        userId_skillId: {
          userId: req.user.userId,
          skillId
        }
      }
    })

    res.status(200).json({ message: 'Want removed' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET ALL USERS (for matchmaking)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
        userSkills: { include: { skill: true } },
        userWants: { include: { skill: true } }
      }
    })

    res.status(200).json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}