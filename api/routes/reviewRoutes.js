const express = require('express');
const {
  getAllReview,
  createReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // mergeParams доступ к параметрам из другого маршрута

router
  .route('/')
  .get(getAllReview)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
