import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { initSocket } from './socket/chatSocket.js';
import meetingRoutes from './routes/meetingRoutes.js'

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/meetings', meetingRoutes);

// Socket.io
const io = new Server(server, {
  cors: { origin: '*' }
});
initSocket(io);

// Health check
app.get('/', (req, res) => res.send('SkillSwap API running ✅'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

