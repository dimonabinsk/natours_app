const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Неверное значение ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const message = `Дубликат значения поля ${Object.keys(err.keyValue)}:'${
    err.keyValue.name
  }'.Измените значение поля: '${Object.keys(err.keyValue)}'!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  // console.log(errors);
  const message = `Ввели неверные данные. ${errors.join('. ').trim()}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Не валидный токен! Попробуйте войти ещё раз!', 401);
};
const handleJWTExpiredError = () => {
  return new AppError(
    'Срок действия Вашего токена истёк! Пожалуйста авторизуйтесь заново!',
    401,
  );
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Операционная ошибка, отправляем сообщение об ошибке клиенту
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Если программная ошибка то клиенту ничего не отправляем
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Что-то пошло не так, попробуйте позже',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));
    console.log('Error: ', error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
