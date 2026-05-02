import prisma from '../lib/prisma.js'

// Calculate match score between two users
const calculateScore = (userA, userB) => {
  const aSkillIds = userA.userSkills.map(us => us.skillId)
  const bSkillIds = userB.userSkills.map(us => us.skillId)
  const aWantIds = userA.userWants.map(uw => uw.skillId)
  const bWantIds = userB.userWants.map(uw => uw.skillId)

  const aHelpsB = aSkillIds.filter(id => bWantIds.includes(id)).length
  const bHelpsA = bSkillIds.filter(id => aWantIds.includes(id)).length

  return aHelpsB + bHelpsA
}

// Calculate distance between two users in km (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get suggested matches for a user
export const findMatches = async (userId) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userSkills: { include: { skill: true } },
      userWants: { include: { skill: true } },
    }
  })

  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      isVerified: true,
    },
    include: {
      userSkills: { include: { skill: true } },
      userWants: { include: { skill: true } },
    }
  })

  // Get existing match requests involving this user
  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ]
    }
  })

  const results = []

  for (const otherUser of otherUsers) {
    const score = calculateScore(currentUser, otherUser)
    if (score === 0) continue

    // Calculate distance
    let distance = null
    if (
      currentUser.latitude && currentUser.longitude &&
      otherUser.latitude && otherUser.longitude
    ) {
      distance = calculateDistance(
        currentUser.latitude, currentUser.longitude,
        otherUser.latitude, otherUser.longitude
      )
    }

    const alreadyExists = existingMatches.find(m =>
      (m.userAId === userId && m.userBId === otherUser.id) ||
      (m.userAId === otherUser.id && m.userBId === userId)
    )

    if (alreadyExists) {
      // Case 1 — current user sent request (pending)
      // Let frontend handle with Cancel button, include in results
      if (alreadyExists.userAId === userId && alreadyExists.status === 'pending') {
        results.push({
          user: {
            id: otherUser.id,
            name: otherUser.name,
            bio: otherUser.bio,
            avatarUrl: otherUser.avatarUrl,
            userSkills: otherUser.userSkills,
            userWants: otherUser.userWants,
          },
          score,
          distance: distance ? `${distance.toFixed(1)} km` : 'Unknown',
          declinedAt: null,
        })
        continue
      }

      // Case 2 — other user sent request to current user (pending)
      // Hide from suggestions since it appears in Requests tab
      if (alreadyExists.userAId === otherUser.id && alreadyExists.status === 'pending') {
        continue
      }

      // Case 3 — declined
      if (alreadyExists.status === 'declined' && alreadyExists.declinedAt) {
        const aDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        if (alreadyExists.declinedAt < aDayAgo) {
          // 1 day passed — delete record so sender can resend
          await prisma.match.delete({ where: { id: alreadyExists.id } })
        } else {
          // Still within cooldown — show disabled button to userA
          if(alreadyExists.userAId === userId) {
            results.push({
              user: {
                id: otherUser.id,
                name: otherUser.name,
                bio: otherUser.bio,
                avatarUrl: otherUser.avatarUrl,
                userSkills: otherUser.userSkills,
                userWants: otherUser.userWants,
              },
              score,
              distance: distance ? `${distance.toFixed(1)} km` : 'Unknown',
              declinedAt: alreadyExists.declinedAt,
            })
          }
          continue
        }
      }

      // Case 4 — accepted
      // Hide from suggestions since they're in Connected tab
      if (alreadyExists.status === 'accepted') continue
    }

    // No existing match — regular suggestion
    
    results.push({
      user: {
        id: otherUser.id,
        name: otherUser.name,
        bio: otherUser.bio,
        avatarUrl: otherUser.avatarUrl,
        userSkills: otherUser.userSkills,
        userWants: otherUser.userWants,
      },
      score,
      distance: distance ? `${distance.toFixed(1)} km` : 'Unknown',
      declinedAt: null,
    })
  
  }

  results.sort((a, b) => b.score - a.score)
  return results
}