const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

const mongoose = require('mongoose');

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/data/reviews.json`));

mongoose
  .connect(process.env.DATABASE, {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
    dbName: 'natours',
  })
  .then(() => {
    console.log('DB connection successful... 💯');
  });

const initDB = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(reviews);
    console.log('DB init successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteDB = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('DB delete successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--init') {
  initDB();
}

if (process.argv[2] === '--delete') {
  deleteDB();
}
