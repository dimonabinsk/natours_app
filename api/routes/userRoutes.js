const express = require('express');

const {
  getAllUsers,
  createUser,
  getUserId,
  updateUserId,
  deleteUserId,
} = require('../controllers/userController');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserId).patch(updateUserId).delete(deleteUserId);

module.exports = router;
