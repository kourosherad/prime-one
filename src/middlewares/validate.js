/**
 * express-validator runner. Pass an array of validation chains to `validate`.
 * On failure, returns 422 with field-level error details.
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validate = (chains) => {
  return [
    ...chains,
    (req, res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();
      const details = {};
      result.array().forEach((err) => {
        const field = err.path || err.param;
        if (!details[field]) details[field] = err.msg;
      });
      return next(ApiError.unprocessable('لطفاً خطاهای فرم را برطرف کنید.', details));
    },
  ];
};

module.exports = validate;
