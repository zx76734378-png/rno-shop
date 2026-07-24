const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        error: 'Validation error',
        details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
      });
    }
  };
}

module.exports = { validate };
