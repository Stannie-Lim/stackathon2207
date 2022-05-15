const router = require('express').Router();
const dotenv = require('dotenv');

dotenv.config();

module.exports = router;

router.use('/auth', require('./auth'));
router.use('/room', require('./room'));
