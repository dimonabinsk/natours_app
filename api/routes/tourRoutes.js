const express = require('express');

const {
  getAllTours,
  createTour,
  getTourId,
  updateTourId,
  deleteTourId,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
// const { createReview } = require('../controllers/reviewController');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);
router.use('/:tourId/reviews', reviewRoutes);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:coordinates/unit/:unit')
  .get(getToursWithin);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTourId)
  .patch(updateTourId)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTourId);

module.exports = router;
