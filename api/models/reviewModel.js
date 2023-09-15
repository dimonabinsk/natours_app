const mongoose = require('mongoose');
// const User = require('./userModel');
// const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Отзыв не может быть пустым'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Отзыв должен принадлежать определённому туру'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Отзыв должен принадлежать определённому пользователю'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
  },
  {
    // отображение виртуальных данных, рассчитанных на основе других данных и не хранящиеся в самой базе
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
