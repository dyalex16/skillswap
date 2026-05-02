import prisma from '../lib/prisma.js'
import { createMeetingRoom } from '../services/meetingService.js'

// CREATE MEETING FOR A MATCH
export const createMeeting = async (req, res) => {
  try {
    const { matchId } = req.params

    // Verify the user is part of this accepted match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: req.user.userId },
          { userBId: req.user.userId },
        ],
        status: 'accepted'
      }
    })

    if (!match) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Check if meeting already exists
    const existing = await prisma.meeting.findUnique({
      where: { matchId }
    })

    if (existing) {
      return res.status(200).json({ roomUrl: existing.roomUrl })
    }

    // Create a new Daily.co room
    const roomUrl = await createMeetingRoom()

    // Save to database
    const meeting = await prisma.meeting.create({
      data: {
        matchId,
        roomUrl,
      }
    })

    res.status(201).json({ roomUrl: meeting.roomUrl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET MEETING FOR A MATCH
export const getMeeting = async (req, res) => {
  try {
    const { matchId } = req.params

    // Verify the user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: req.user.userId },
          { userBId: req.user.userId },
        ],
        status: 'accepted'
      }
    })

    if (!match) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { matchId }
    })

    if (!meeting) {
      return res.status(404).json({ message: 'No meeting found for this match' })
    }

    res.status(200).json({ roomUrl: meeting.roomUrl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}