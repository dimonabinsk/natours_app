const express = require('express');
const {
  getAllReview,
  createReview,
  deleteReview,
  updateReview,
  setTourUserId,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // mergeParams доступ к параметрам из другого маршрута

router
  .route('/')
  .get(getAllReview)
  .post(protect, restrictTo('user'), setTourUserId, createReview);

router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;
