const mongoose = require('mongoose');
const validator = require('validator');

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
    trim: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
