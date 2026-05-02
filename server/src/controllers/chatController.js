import prisma from '../lib/prisma.js'

// GET CHAT HISTORY FOR A MATCH
export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params

    // Verify the user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { id: matchId, userAId: req.user.userId },
          { id: matchId, userBId: req.user.userId },
        ],
        status: 'accepted'
      }
    })

    if (!match) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    res.status(200).json(messages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET UNREAD MESSAGE COUNTS FOR ALL MATCHES
export const getUnreadCounts = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: req.user.userId },
          { userBId: req.user.userId },
        ],
        status: 'accepted'
      },
      select: { id: true }
    })

    const counts = {}

    for (const match of matches) {
      const count = await prisma.message.count({
        where: {
          matchId: match.id,
          isRead: false,
          senderId: { not: req.user.userId }
        }
      })
      counts[match.id] = count
    }

    res.status(200).json(counts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// MARK MESSAGES AS READ
export const markAsRead = async (req, res) => {
  try {
    const { matchId } = req.params

    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: req.user.userId },
        isRead: false
      },
      data: { isRead: true }
    })

    res.status(200).json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}