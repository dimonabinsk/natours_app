const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const { default: helmet } = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const xss = require('./utils/xssFilter');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Статические файлы
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// Журнал (logs) разработки
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 100, // Ограничьте каждый IP-адрес 100 запросами
  standardHeaders: 'draft-7', // Установите заголовки `Ограничение скорости" и "Политика ограничения скорости"
  legacyHeaders: false, // Отключите заголовки `X-RateLimit-*`
  message:
    'Слишком много запросов с этого IP, пожалуйста, повторите попытку через час!',
  // store: ... , // Use an external store for more precise rate limiting
});
// GLOBAL MIDDLEWARE

// Установите защищенные HTTP-заголовки

app.use(helmet());

// Синтаксический анализатор тела, считывающий данные из тела в req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);

// Очистка данных от внедрения запросов NoSQL
app.use(mongoSanitize());

// Очистка данных от XSS (меж-сайтовых скриптов)
app.use(xss());

// Очистка загрязнения параметров HTTP
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Ограничение запросов с одного и того-же IP-адреса
app.use('/api', apiLimiter);

// тестовое промежуточное ПО (test middleware)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Не удалось найти адрес ${req.originalUrl} на сервере`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;
