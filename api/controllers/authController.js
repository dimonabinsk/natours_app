const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, photo, passwordChangedAt } =
    req.body;
  const newUser = await User.create({
    name: name,
    email: email,
    password: password,
    passwordConfirm: passwordConfirm,
    photo: photo,
    passwordChangedAt: passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

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

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

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
