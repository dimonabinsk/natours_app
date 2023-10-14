const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm: login,
} = require('../controllers/viewController');
const { isLoggedIn } = require('../controllers/authController');

const router = express.Router();

// Routes

router.use(isLoggedIn);

router.get('/', getOverview);

router.get('/tour/:slug', getTour);

router.get('/login', login);

module.exports = router;
