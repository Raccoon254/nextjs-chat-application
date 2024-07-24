import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('join', ({ name, room }) => {
        socket.join(room);
        console.log(`${name} joined room ${room}`);
        socket.to(room).emit('message', { user: 'system', text: `${name} has joined the chat` });
      });

      socket.on('sendMessage', (message) => {
        const user = getUserInfo(socket);
        if (user) {
          io.to(user.room).emit('message', { user: user.name, text: message });
        }
      });

      socket.on('typing', (isTyping) => {
        const user = getUserInfo(socket);
        if (user) {
          socket.to(user.room).emit('typing', isTyping);
        }
      });

      socket.on('disconnect', () => {
        const user = getUserInfo(socket);
        if (user) {
          io.to(user.room).emit('message', { user: 'system', text: `${user.name} has left the chat` });
        }
      });
    });
  }
  res.end();
};

// Helper function to get user info from socket
function getUserInfo(socket) {
  const rooms = Array.from(socket.rooms);
  if (rooms.length > 1) {
    return {
      name: socket.handshake.query.name,
      room: rooms[1] // The first room is always the socket ID, so we take the second one
    };
  }
  return null;
}

export default SocketHandler;