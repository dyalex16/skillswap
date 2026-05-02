import { findMatches } from '../services/matchService.js'
import prisma from '../lib/prisma.js'

// GET SUGGESTED MATCHES (people you haven't connected with yet)
export const getMatches = async (req, res) => {
  try {
    const matches = await findMatches(req.user.userId)
    res.status(200).json(matches)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// SEND A MATCH REQUEST
export const sendMatchRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body

    // Can't send request to yourself
    if (targetUserId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' })
    }

    // Check if request already exists
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId: req.user.userId, userBId: targetUserId },
          { userAId: targetUserId, userBId: req.user.userId },
        ]
      }
    })

    if (existing) {
      return res.status(400).json({ message: 'Match request already exists' })
    }

    const match = await prisma.match.create({
      data: {
        userAId: req.user.userId,
        userBId: targetUserId,
        score: 0,
        status: 'pending'
      }
    })

    res.status(201).json({ message: 'Match request sent!', match })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET INCOMING REQUESTS (requests sent TO the current user)
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await prisma.match.findMany({
      where: {
        userBId: req.user.userId,
        status: 'pending'
      },
      include: {
        userA: {
          select: {
            id: true, name: true, bio: true, avatarUrl: true,
            userSkills: { include: { skill: true } },
            userWants: { include: { skill: true } },
          }
        }
      }
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET SENT REQUESTS (requests sent BY the current user)
export const getSentRequests = async (req, res) => {
  try {
    const requests = await prisma.match.findMany({
      where: {
        userAId: req.user.userId,
        status: 'pending'
      },
      include: {
        userB: {
          select: { id: true, name: true, bio: true, avatarUrl: true }
        }
      }
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ACCEPT OR DECLINE A MATCH REQUEST
export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params
    const { status } = req.body

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    // Only the receiver (userB) can accept or decline
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        userBId: req.user.userId,
        status: 'pending'
      }
    })

    if (!match) {
      return res.status(403).json({ message: 'Not authorized or match not found' })
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { 
        status,
        ...(status === 'declined' && { declinedAt: new Date() })
       }
    })

    res.status(200).json({ message: `Match ${status}`, match: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// CANCEL A MATCH REQUEST
export const cancelMatchRequest = async (req, res) => {
  try {
    const { matchId } = req.params

    // Only the sender (userA) can cancel
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        userAId: req.user.userId,
        status: 'pending'
      }
    })

    if (!match) {
      return res.status(403).json({ message: 'Not authorized or match not found' })
    }

    await prisma.match.delete({ where: { id: matchId } })

    res.status(200).json({ message: 'Match request cancelled' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET ACCEPTED MATCHES
export const getAcceptedMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: req.user.userId },
          { userBId: req.user.userId },
        ],
        status: 'accepted'
      },
      include: {
        userA: {
          select: { id: true, name: true, bio: true, avatarUrl: true }
        },
        userB: {
          select: { id: true, name: true, bio: true, avatarUrl: true }
        },
        meeting: true,
      }
    })

    res.status(200).json(matches)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}