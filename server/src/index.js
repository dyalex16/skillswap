import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js'

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { initSocket } from './socket/chatSocket.js';
import meetingRoutes from './routes/meetingRoutes.js'

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/meetings', meetingRoutes);

// Socket.io
const io = new Server(server, {
  cors: { 
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});
initSocket(io);

// Health check
app.get('/', (req, res) => res.send('SkillSwap API running ✅'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

