const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', auth, userController.getProfile);
router.patch('/me', auth, userController.updateProfile);

module.exports = router;