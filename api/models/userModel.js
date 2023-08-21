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
  photo: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Пожалуйста, укажите пароль'],
    trim: true,
    minLength: 8,
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

const User = mongoose.model('User', userSchema);

module.exports = User;
