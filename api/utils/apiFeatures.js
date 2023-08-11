class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    // 1) фильтрация простая
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) фильтрация продвинутая
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      // сортировка по умолчанию
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 4) Ограничение выдаваемых полей запроса
    if (this.queryString.fields) {
      const fieldsLimit = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsLimit);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 5) Пагинация
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const countTour = await this.query.countDocuments();
    //   if (skip >= countTour) throw new Error('This page does not exist');
    // }
    return this;
  }
}

module.exports = APIFeatures;
