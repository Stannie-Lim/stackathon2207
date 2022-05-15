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
    console.log(userId, roomcode);
    const user = await User.findByPk(userId);

    if (user) {
      user.roomId = null;
      await user.save();
    }

    io.to(roomcode).emit('join', await Room.findByPk(roomcode, { include: User }));
  });

  socket.on('join_room', async ({ userId, roomcode }) => {
    let user = await User.findByPk(userId);
    if (!user) user = await User.create({ spotifyId: userId });

    const room = await Room.findByPk(roomcode);
    user.roomId = room.id;
    await user.save();

    socket.join(roomcode);
    io.to(roomcode).emit('join', await Room.findByPk(roomcode, { include: User }));
  });
});
