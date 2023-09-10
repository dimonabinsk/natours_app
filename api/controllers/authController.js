const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  // отправляем cookie браузеру
  res.cookie('jwt', token, cookieOptions);

  // удаляем пароль при отправке на клиент
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// Регистрация пользователя
exports.signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    photo,
    passwordChangedAt,
    role,
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo,
    passwordChangedAt,
    role,
  });

  createSendToken(newUser, 201, res);
});

// Авторизация пользователя
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) проверить существует ли email и password у пользователя
  if (!email || !password) {
    return next(
      new AppError('Пожалуйста, введите электронную почту и пароль!', 400),
    );
  }

  // 2) проверить корректность email и password пользователя

  const user = await User.findOne({ email: email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Не правильная электронная почта или пароль!', 401),
    );
  }

  // 3) если всё корректно отправить token на клиент
  createSendToken(user, 200, res);
});

// Ограничение на каждый IP-адрес до 10 запросов на  вход в приложение
exports.loginAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10,
  message:
    'Слишком много попыток входа с этого IP, пожалуйста, повторите попытку позже',
  standardHeaders: 'draft-7', // draft-6: заголовки RateLimit-*; draft-7: заголовок комбинированного ограничения скорости
  legacyHeaders: false, // X-RateLimit-* заголовки
});

// Проверка на то,что пользователь авторизован
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Проверить есть ли токен
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new AppError(
        'Вы не вошли в систему! Пожалуйста авторизуйтесь для доступа к системе',
        401,
      ),
    );
  }
  // console.log(token);

  // 2) Верифицировать токен
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3) Проверить, существует ли еще пользователь
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'Пользователя, которому принадлежит токен, больше не существует',
        401,
      ),
    );
  }
  // console.log(freshUser);

  // 4) Проверить, сменил ли пользователь пароль после выдачи токена
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Пользователь недавно сменил пароль! Пожалуйста авторизуйтесь снова!',
        401,
      ),
    );
  }
  // 5) Предоставить доступ к защищённому маршруту
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('У Вас нет разрешения на выполнение этого действия', 403),
      );
    }
    next();
  };
};

// Забыл пароль?
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Получить пользователя на основе его электронной почты (email)
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('Пользователя с таким адресом почты не существует', 404),
    );
  }
  // console.log(user);

  // 2) Сгенерировать случайный токен
  const resetToken = user.createPasswordResetToken();
  user.save({
    validateBeforeSave: false,
  });

  // 3) Отправить токен на почту пользователя

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Забыли свой пароль? Отправьте запрос на исправление с вашим новым паролем и подтверждением пароля по адресу: ${resetURL}.\nЕсли вы не забыли свой пароль, пожалуйста, проигнорируйте это письмо!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Токен сброса вашего пароля (действителен в течение 10 минут)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Токен отправлен на электронную почту!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Произошла ошибка при отправке электронного письма. Попробуйте еще раз позже!',
      ),
      500,
    );
  }

  // next();
});

// Смена пароля
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Получаем пользователя на основе токена
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) Если срок действия токена не истёк, меняем пароль пользователя
  if (!user) {
    return next(
      new AppError('Токен не действителен или его срок действия истёк', 400),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Изменяем changedPasswordAt для текущего пользователя
  // 4) Входим в систему, отправляем на клиент JWT
  createSendToken(user, 200, res);
});

// Смена пароля по желанию пользователя
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) получаем пользователя из коллекции
  const user = await User.findById(req.user.id).select('+password');
  // 2) проверяем корректность введённого текущего пароля
  const correctPassword = await user.correctPassword(
    req.body.passwordCurrent,
    user.password,
  );
  if (!correctPassword) {
    return next(new AppError('Ваш текущий пароль не верен', 401));
  }
  // 3) если пароль верный, то обновляем его
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) опять авторизуем пользователя и отправляем новый JWT на клиент
  createSendToken(user, 200, res);
});
