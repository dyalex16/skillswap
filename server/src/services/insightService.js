import Anthropic from '@anthropic-ai/sdk'
import prisma from '../lib/prisma.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const generateMatchInsight = async (matchId) => {
  // Check cache first — never call LLM twice for same match
  const existing = await prisma.matchInsight.findUnique({
    where: { matchId }
  })
  if (existing) return existing

  // Fetch match with both users' full skill data
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      userA: {
        select: {
          name: true,
          userSkills: { include: { skill: true } },
          userWants: { include: { skill: true } },
        }
      },
      userB: {
        select: {
          name: true,
          userSkills: { include: { skill: true } },
          userWants: { include: { skill: true } },
        }
      }
    }
  })

  if (!match) throw new Error('Match not found')

  // Build structured prompt — pass JSON not free text
  const structuredData = {
    userA: {
      name: match.userA.name,
      skills: match.userA.userSkills.map(us => ({
        name: us.skill.name,
        level: us.level,
        category: us.skill.category
      })),
      wants: match.userA.userWants.map(uw => uw.skill.name)
    },
    userB: {
      name: match.userB.name,
      skills: match.userB.userSkills.map(us => ({
        name: us.skill.name,
        level: us.level,
        category: us.skill.category
      })),
      wants: match.userB.userWants.map(uw => uw.skill.name)
    },
    matchScore: match.score
  }

  const prompt = `You are a helpful assistant for a skill-exchange platform called SkillSwap.

Here is structured data about two matched users:
${JSON.stringify(structuredData, null, 2)}

Based on this data, generate:
1. A 2-3 sentence explanation of why these two users are a great match, referencing their specific skills and what each can teach the other.
2. Exactly 3 personalized conversation starter suggestions to help them break the ice.

Respond ONLY with a JSON object in this exact format, no preamble or markdown:
{
  "explanation": "your explanation here",
  "starters": ["starter 1", "starter 2", "starter 3"]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].text
    const parsed = JSON.parse(text)

    // Cache in database
    const insight = await prisma.matchInsight.create({
      data: {
        matchId,
        explanation: parsed.explanation,
        starters: parsed.starters,
      }
    })

    return insight
  } catch (error) {
    console.error('Insight generation failed:', error)
    // Return null on failure — match still works without insight
    return null
  }
}