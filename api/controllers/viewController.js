const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 получаем данные туров из коллекции
  const tours = await Tour.find();
  // 2 создаём шаблон визуализации

  // 3 рендер шаблона на основе данных из 1 пункта
  res.status(200).render('overview', {
    title: 'All Tour',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user ',
  });

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = async (req, res, next) => {
  res.render('login', {
    title: 'Log into your account',
  });
};
