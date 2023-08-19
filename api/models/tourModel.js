const mongoose = require('mongoose');
// const { isAlpha } = require('validator');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'Длина имени не должна превышать 40 символов'],
      minLength: [10, 'Длина имени не должна быть меньше 10 символов'],
      // validate: [isAlpha, 'Имя tour должно содержать только буквы'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "Сложность должна быть только: 'easy', 'medium', 'difficult'",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Рейтинг должен быть меньше 5'],
      min: [1, 'Рейтинг должен быть больше 1'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // this работает только при создании нового документа,
          // при обновлении не работает
          return value < this.price;
        },
        message: 'Скидка ({VALUE}) не должна превышать настоящую стоимость',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
      trim: true,
    },
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // скрываем поле при выдаче запроса пользователю,
      // полезно если нужно скрыть какую-нибудь
      // информацию(например password)
      select: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// будет работать перед методами '.save' и '.create'
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
// // будет работать после методов '.save' и '.create'
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// промежуточный слой при запросе (query middleware)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Запрос занял ${Date.now() - this.start} миллисекунд(ы)`);
  // console.log(doc);
  // this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
