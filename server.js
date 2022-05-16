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

    let dbUser = await User.findByPk(userId);
    if (!dbUser) dbUser = await User.create({ spotifyId: userId, name: user.display_name, imageUrl: user.images[0].url });

    const room = await Room.findByPk(roomcode);
    dbUser.roomId = room.id;
    await dbUser.save();

    socket.join(roomcode);
    io.to(roomcode).emit('join', await Room.findByPk(roomcode, { include: User }));
    io.to(roomcode).emit('sync_songs', songs);
  });

  socket.on('sync_songs', ({ roomId, songs }) => io.to(roomId).emit('sync_songs', songs));
});
