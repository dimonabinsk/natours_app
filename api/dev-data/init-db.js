const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const Tour = require('../models/tourModel');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`),
);

mongoose
  .connect(process.env.DATABASE || 'mongodb://localhost:27017/', {
    user: process.env.USERNAME || 'dimon',
    pass: process.env.PASSWORD || '12345',
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
