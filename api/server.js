const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'debug') {
  dotenv.config({ path: '../config.env' });
}

const mongoose = require('mongoose');

const app = require('./app');

if (process.env.DATABASE) {
  mongoose
    .connect(process.env.DATABASE, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      user: process.env.USERNAME,
      pass: process.env.PASSWORD,
      dbName: 'natours',
    })
    .then(() => {
      console.log('DB connection successful... 💯');
    });
}
if (process.env.PORT) {
  app.listen(process.env.PORT, () => {
    console.log(`Приложение работает на порте: ${process.env.PORT}...`);
  });
}
