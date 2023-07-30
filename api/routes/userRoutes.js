const express = require('express');

const {
  getAllUsers,
  createUser,
  getUserId,
  updateUserId,
  deleteUserId,
} = require('../controllers/userController');

const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserId).patch(updateUserId).delete(deleteUserId);

module.exports = router;
