const express = require('express');

const {
  getAllUsers,
  createUser,
  getUserId,
  updateUserId,
  deleteUserId,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  loginAccountLimiter,
} = require('../controllers/authController');

const router = express.Router();
router.route('/me').get(protect, getMe, getUserId);

router.post('/signup', signup);
router.post('/login', loginAccountLimiter, login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserId).patch(updateUserId).delete(deleteUserId);

module.exports = router;
