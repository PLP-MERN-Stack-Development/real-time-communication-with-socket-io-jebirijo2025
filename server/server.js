const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
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

const users = new Map();
const messages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_join', (userData) => {
    users.set(socket.id, userData);
    socket.broadcast.emit('user_joined', {
      username: userData.username,
      message: \\ joined the chat\
    });
  });

  socket.on('send_message', (data) => {
    const user = users.get(socket.id);
    const message = {
      id: Date.now().toString(),
      username: user.username,
      content: data.content,
      timestamp: new Date()
    };
    
    messages.push(message);
    io.emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      socket.broadcast.emit('user_left', {
        username: user.username,
        message: \\ left the chat\
      });
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(\Server running on port \\);
});
