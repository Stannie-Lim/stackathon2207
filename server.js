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

    io.to(roomcode).emit('join', await Room.findByPk(roomcode, { include: User }));
  });

  socket.on('join_room', async ({ user, roomcode, songs }) => {
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
    io.to(roomcode).emit('join', await Room.findByPk(roomcode, { include: User }));
    io.to(roomcode).emit('sync_songs', songs);
  });

  socket.on('sync_songs', ({ roomId, userId }) => io.to(roomId).emit('sync_songs', userId));
  socket.on('change_song', ({ roomId, index }) => io.to(roomId).emit('change_song', index));
  socket.on('pauseunpause', ({ roomId, play }) => io.to(roomId).emit('pauseunpause', play));
  socket.on('change_position', ({ roomId, position }) => io.to(roomId).emit('change_position', position));
});
