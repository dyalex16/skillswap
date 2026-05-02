import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

export const initSocket = (io) => {

  // Authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Unauthorized'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      next()
    } catch (error) {
      return next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`)

    // Join a match chat room
    socket.on('join_room', async (matchId) => {
      // Verify user belongs to this match
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          OR: [
            { userAId: socket.userId },
            { userBId: socket.userId },
          ],
          status: 'accepted'
        }
      })

      if (!match) {
        socket.emit('error', 'Access denied')
        return
      }

      socket.join(matchId)
      console.log(`User ${socket.userId} joined room ${matchId}`)
    })

    // Send a message
    socket.on('send_message', async ({ matchId, content }) => {
      try {
        // Verify user belongs to this match
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [
              { userAId: socket.userId },
              { userBId: socket.userId },
            ],
            status: 'accepted'
          }
        })

        if (!match) {
          socket.emit('error', 'Access denied')
          return
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            matchId,
            senderId: socket.userId,
            content,
          },
          include: {
            sender: {
              select: { id: true, name: true, avatarUrl: true }
            }
          }
        })

        // Broadcast message to everyone in the room
        io.to(matchId).emit('receive_message', message)
      } catch (error) {
        console.error(error)
        socket.emit('error', 'Failed to send message')
      }
    })

    // Leave a room
    socket.on('leave_room', (matchId) => {
      socket.leave(matchId)
      console.log(`User ${socket.userId} left room ${matchId}`)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })
}