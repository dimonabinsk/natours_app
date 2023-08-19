const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('НЕПЕРЕХВАЧЕННОЕ ИСКЛЮЧЕНИЕ!💥 Отключаюсь...');
  console.log(err.name, err.message);
  process.exit(1);
});

if (process.env.NODE_ENV === 'debug') {
  dotenv.config({ path: '../config.env' });
}

const mongoose = require('mongoose');

const app = require('./app');
// process.env.PASSWORD
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

  const server = app.listen(process.env.PORT, () => {
    console.log(`Приложение запущено на порте: ${process.env.PORT}...`);
  });

  process.on('unhandledRejection', (err) => {
    console.log('НЕОБРАБОТАННЫЙ ОТКАЗ!💥 Отключаюсь...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}
