const mongoose = require('mongoose');

const app = require('./app');

mongoose
  .connect(process.env.DATABASE, {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
    dbName: 'natours',
  })
  .then(() => {
    console.log('DB connection successful... 💯');
  });


app.listen(process.env.PORT, () => {
  console.log(`Приложение работает на порте: ${process.env.PORT}...`);
});
