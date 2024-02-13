const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Connected');

  socket.on('join', (userData) => {
    const { username, color } = userData;
    socket.username = username;
    socket.color = color;

    users[socket.id] = { username, color };

    io.emit('message', `He joined us ${username}`);

    io.emit('updateUsers', users);
  });

  socket.on('message', (messageData) => {
    const { message, recipient } = messageData;
    if (recipient) {
      const recipientSocket = Object.values(io.sockets.sockets).find((s) => s.username === recipient);
      if (recipientSocket) {
        recipientSocket.emit('message', `${socket.username}: ${message}`);
      }
    } else {
      io.emit('message', `${socket.username}: ${message}`);
    }
  });

  socket.on('disconnect', () => {
    const username = socket.username || 'User';
    delete users[socket.id];
    io.emit('message', `${username} left the chat`);
    io.emit('updateUsers', users);
  });
});

http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});