const authMiddleware = require('./auth.middleware');
const roleMiddleware = require('./role.middleware');
const errorHandler = require('./error.handler');
const requestLogger = require('./request.logger');

module.exports = {
  authMiddleware,
  roleMiddleware,
  errorHandler,
  requestLogger
};