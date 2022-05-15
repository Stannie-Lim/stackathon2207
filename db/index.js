const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/spotifyapp', { logging: false });

const Room = db.define('room', {
  id: {
    type: Sequelize.DataTypes.STRING(5),
    primaryKey: true,
  },
});

const User = db.define('user', {
  spotifyId: {
    type: Sequelize.DataTypes.STRING,
    primaryKey: true,
  },
});

// Room.beforeCreate(function() {
//   const createId = async (length = 5) => {
//     let result = '';
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     const charactersLength = characters.length;
//     for (let i = 0; i < length; i++ ) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }

//     if (await Room.findByPk(result)) return createId();
//     return result;
//   }
//   console.log('hell asdsadsadao');
//   this.id = createId();
// });

User.belongsTo(Room);
Room.hasMany(User);

const syncAndSeed = async () => {
  try {
    await db.sync({ force: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  db,
  User,
  Room,
  syncAndSeed,
};