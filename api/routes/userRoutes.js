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
  restrictTo,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginAccountLimiter, login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Защищаем все маршруты ниже, только авторизованные пользователи имеют к ним доступ
router.use(protect);

router.get('/me', getMe, getUserId);
router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// Ниже доступно только администратору
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserId).patch(updateUserId).delete(deleteUserId);

module.exports = router;
