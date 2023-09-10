const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

const mongoose = require('mongoose');

const Tour = require('../models/tourModel');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`),
);

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
    console.log('DB init successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteDB = async () => {
  try {
    await Tour.deleteMany();
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
