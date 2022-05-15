const router = require('express').Router();
const { Room, User } = require('../db');

module.exports = router;

router.post('/', async (req, res, next) => {
  try {
    const createId = async (length = 5) => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRTUVWXYZ2346789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
  
      if (await Room.findByPk(result)) return createId();
      return result;
    }
    const room = await Room.create({ id: await createId() });

    res.status(201).send(room);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  res.send(await Room.findByPk(req.params.id, { include: User }));
});