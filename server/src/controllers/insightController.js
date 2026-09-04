import prisma from '../lib/prisma.js'
import { generateMatchInsight } from '../services/insightService.js'

export const getMatchInsight = async (req, res) => {
  try {
    const { matchId } = req.params

    // Verify user is part of this match
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

    const insight = await generateMatchInsight(matchId)

    if (!insight) {
      return res.status(200).json({
        explanation: null,
        starters: [],
        fallback: true
      })
    }

    res.status(200).json(insight)
  } catch (error) {
    console.error(error)
    // Graceful fallback — don't crash the match feature
    res.status(200).json({
      explanation: null,
      starters: [],
      fallback: true
    })
  }
}