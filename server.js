const express = require('express');
const path = require('path');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const { syncAndSeed, User, Room } = require('./db');

app.use(express.json());

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.use('/api', require('./routes'));

const port = process.env.PORT || 3000;

syncAndSeed()
  .then(() => http.listen(port, ()=> console.log(`listening on port ${port}`)));

io.on('connection', socket => {
  console.log(`[${socket.id}] socket connected`);
  socket.on('disconnect_room', async ({ userId, roomcode }) => {
    const user = await User.findByPk(userId);

    if (user) {
      user.roomId = null;
      await user.save();
    }

    const room = await Room.findByPk(roomcode, { include: User });
    io.to(roomcode).emit('join', room);
  });

  socket.on('join_room', async ({ user, roomcode }) => {
    const userId = user.id;

    const dbUser = await User.findOrCreate({
      where: {
        spotifyId: userId,
      },
      defaults: {
        spotifyId: userId,
        name: user.display_name,
        imageUrl: user?.images[0]?.url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png',
      },
    });

    const room = await Room.findByPk(roomcode);
    dbUser[0].roomId = room.id;
    await dbUser[0].save();

    socket.join(roomcode);
    const foundRoom = await Room.findByPk(roomcode, { include: User });
    io.to(roomcode).emit('join', { room: foundRoom, user: dbUser[0] });
  });

  socket.on('sync_songs', ({ roomId, songs }) => io.to(roomId).emit('sync_songs', songs));
  socket.on('change_song', ({ roomId, index }) => io.to(roomId).emit('change_song', index));
  socket.on('pauseunpause', ({ roomId, play }) => io.to(roomId).emit('pauseunpause', play));
  socket.on('change_position', ({ roomId, position }) => io.to(roomId).emit('change_position', position));
  socket.on('hover', (data) => io.to(data.roomId).emit('hover', data));
  socket.on('unhover', (data) => io.to(data.roomId).emit('unhover', data));
  socket.on('message', data => io.to(data.roomId).emit('message', data));
});
