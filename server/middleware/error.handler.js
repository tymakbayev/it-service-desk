/**
 * Глобальный обработчик ошибок
 * @param {Error} err - Объект ошибки
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  
  // Определяем тип ошибки и соответствующий статус
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Ошибка авторизации';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Доступ запрещен';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Ресурс не найден';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;