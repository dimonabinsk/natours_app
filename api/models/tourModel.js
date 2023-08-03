const mongoose = require('mongoose');

const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
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
  console.log(doc);
  // this.find({ secretTour: { $ne: true } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
