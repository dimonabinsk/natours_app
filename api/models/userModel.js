const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// function validatorEmail (value) {
//         return value.match(
//           /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
//         );
//       }

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, введите своё имя'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Пожалуйста, введите Вашу электронную почту'],
    validate: {
      validator: validator.isEmail,
      message: 'Не правильно введён адрес электронной почты',
    },
    unique: true,
    lowerCase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Пожалуйста, укажите пароль'],
    trim: true,
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Пожалуйста, повторите пароль'],
    validate: {
      validator: function (pass) {
        // работает только при создании и сохранении
        return pass === this.password;
      },
      message: 'Пароли не совпадают',
    },
    trim: true,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Устанавливаем время смены пароля
  // Из-за разницы в скорости работы базы данных и получения токена от API,
  // то от времени отнимаем 1 секунду на всякий случай,
  // чтобы получать токен после смены пароля
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  // Эта функция запускается если пароль был фактически модифицирован
  if (!this.isModified('password')) return next();

  // Хэшируем пароль стоимостью 12
  this.password = await bcrypt.hash(this.password, 12);
  // Удаляем пароль в поле passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  // перед любым запросом find** отображаем
  //пользователей с активной учёной записью(не удалённой им)
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, `passwordResetToken:${this.passwordResetToken}`);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
