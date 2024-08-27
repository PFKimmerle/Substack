const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Replace the connection string with your MongoDB URI
mongoose.connect('mongodb://<username>:<password>@<hostname>:<port>/<dbname>', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const MessageSchema = new mongoose.Schema({
  content: String,
  user: {
    name: String,
    avatar: String
  },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  Message.find().sort({ timestamp: -1 }).limit(50).then(messages => {
    socket.emit('initial messages', messages.reverse());
  });

  socket.on('sendMessage', (message) => {
    const newMessage = new Message(message);
    newMessage.save().then(() => {
      io.emit('message', message);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));