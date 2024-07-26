require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { generateWord } = require('./utils/word-generator');
const { calculateScore } = require('./utils/score-calculator');
const Room = require('./models/room');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/api/create-room', async (req, res) => {
  try {
    const room = new Room();
    await room.save();
    res.json({ roomId: room._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join room', async ({ roomId, playerName }) => {
    socket.join(roomId);
    console.log(`${playerName} joined room ${roomId}`);

    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      const player = { id: socket.id, name: playerName, score: 0 };
      room.players.push(player);
      await room.save();

      if (room.players.length === 1) {
        room.currentDrawer = socket.id;
        room.currentWord = generateWord();
        await room.save();
        startNewRound(roomId);
      }

      io.to(roomId).emit('room update', {
        players: room.players,
        currentDrawer: room.currentDrawer
      });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('draw', (data) => {
    socket.to(data.roomId).emit('draw', data);
  });

  socket.on('clear canvas', ({ roomId }) => {
    socket.to(roomId).emit('clear canvas');
  });

  socket.on('chat message', async ({ roomId, message }) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      io.to(roomId).emit('chat message', {
        username: player.name,
        text: message
      });

      if (room.currentWord && message.toLowerCase() === room.currentWord.toLowerCase()) {
        const score = calculateScore(room.roundStartTime);
        player.score += score;
        await room.save();

        io.to(roomId).emit('correct guess', {
          playerId: socket.id,
          playerName: player.name,
          score: player.score
        });

        startNewRound(roomId);
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    try {
      const room = await Room.findOne({ 'players.id': socket.id });
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.currentDrawer === socket.id) {
          startNewRound(room._id);
        }
        await room.save();
        io.to(room._id).emit('room update', {
          players: room.players,
          currentDrawer: room.currentDrawer
        });
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

async function startNewRound(roomId) {
  try {
    const room = await Room.findById(roomId);
    if (!room || room.players.length === 0) return;

    const nextDrawerIndex = (room.players.findIndex(p => p.id === room.currentDrawer) + 1) % room.players.length;
    room.currentDrawer = room.players[nextDrawerIndex].id;
    room.currentWord = generateWord();
    room.roundStartTime = Date.now();
    await room.save();

    io.to(roomId).emit('new round', {
      drawer: room.currentDrawer,
      word: room.currentWord
    });

    startTimer(roomId);
  } catch (error) {
    console.error('Error starting new round:', error);
  }
}

function startTimer(roomId) {
  let timeLeft = 60;
  const timerId = setInterval(() => {
    timeLeft -= 1;
    io.to(roomId).emit('timer update', timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timerId);
      startNewRound(roomId);
    }
  }, 1000);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));