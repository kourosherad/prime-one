const BaseModel = require('./base');
const db = require('../config/db');

class ReviewModel extends BaseModel {
  constructor() {
    super('reviews');
  }

  forProduct(productId, { onlyApproved = true } = {}) {
    let q = db('reviews')
      .join('users', 'users.id', 'reviews.user_id')
      .select(
        'reviews.id',
        'reviews.rating',
        'reviews.title',
        'reviews.body',
        'reviews.created_at',
        'users.first_name',
        'users.last_name'
      )
      .where('reviews.product_id', productId);
    if (onlyApproved) q = q.andWhere('reviews.is_approved', true);
    return q.orderBy('reviews.created_at', 'desc');
  }

  aggregate(productId) {
    return db('reviews')
      .where({ product_id: productId, is_approved: true })
      .avg({ average: 'rating' })
      .count({ count: '*' })
      .first();
  }

  hasReviewed(productId, userId) {
    return db('reviews').where({ product_id: productId, user_id: userId }).first();
  }
}

module.exports = new ReviewModel();
module.exports.ReviewModel = ReviewModel;
