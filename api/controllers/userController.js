const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'Этот маршрут не определен! Пожалуйста, используйте вместо этого /signup!',
  });
};

// обновление данных пользователя: пароль и почта
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) создаём ошибку если пользователь пытается изменить пароль
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Этот маршрут не для обновления пароля. Пожалуйста используйте путь /updatePassword',
        400,
      ),
    );
  }
  // 2) обновляем данные пользователя
  const filterBody = filterObj(req.body, 'name', 'email');

  // 3) разрешаем обновлять только заданные поля у пользователя
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

// удаление пользователя самим пользователем, не полностью из базы
// (меняем учётную запись на не активную, давая возможность её восстановить)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// конечная точка /me
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUserId = factory.getOne(User);

// не для обновления ПАРОЛЯ!!!! (доступно только админу)
exports.updateUserId = factory.updateOne(User);

// полное удаление пользователя из базы данных (доступно только админу)
exports.deleteUserId = factory.deleteOne(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     message: 'success',
//     results: users.length,
//     data: { users },
//   });
// });
