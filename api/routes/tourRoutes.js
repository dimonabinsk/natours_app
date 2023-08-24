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
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTourId)
  .patch(updateTourId)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTourId);

module.exports = router;
