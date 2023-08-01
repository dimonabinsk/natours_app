const express = require('express');

const {
  getAllTours,
  createTour,
  getTourId,
  updateTourId,
  deleteTourId,
  aliasTopTours,
  getTourStats,
} = require('../controllers/tourController');

const router = express.Router();
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTourId).patch(updateTourId).delete(deleteTourId);

module.exports = router;
