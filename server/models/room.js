const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id: String,
  name: String,
  score: { type: Number, default: 0 }
});

const roomSchema = new mongoose.Schema({
  players: [playerSchema],
  currentWord: String,
  currentDrawer: String,
  roundStartTime: Date,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);