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

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
};
