const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: String,
  user: {
    name: String,
    avatar: String
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);