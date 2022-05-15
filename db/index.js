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
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

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